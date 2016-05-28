// an abstraction of neo4j calls
// a wrapper for cypher queries and the request module
'use strict';
{
	module.exports = {
		createNewRoot,
		configureDatabase,
		getNode,
		mergeNode,
		createChildren,
		backup,
		bestChild,
		treePolicy
	}

	/**
	 * JSON representation of neo4j tree objects
	 * @property {Object} TreeNode               - neo4j board state tree node object
	 * @param {Number}    TreeNode.index         - hashed board value
	 * @param {String}    TreeNode.board         - stringified, generalized RiskBoard object
	 * @param {Boolean}   TreeNode.nonTerminal   - is this board a game over state?
	 * @param {Number}    TreeNode.rewards 		   - non-negative value increased by 1 for every winning outcome simulated by nodes in this branch
	 * @param {Number}    TreeNode.visits	       - how many times a simulation has been run on this node or any of its children
	 * @param {Number}    TreeNode.createdAt     - Epoch time date representation when this node was generated
	 */

	var config = require('config') ,
		auth = new Buffer(config.get('neo4j.username') + ':' + config.get('neo4j.password')) ,
		request = require('request') ,
		_ = require('lodash') ,
		Q = require('q') ,
		async = require('async') ,
		neo4jParser = require('neo4j-parser') ,
		neo4j = request.defaults({
			method: 'POST',
			url: config.get('neo4j.baseUrl'),
			headers: {
				Authorization: 'Basic ' + auth.toString('base64')
			}
		}) ,
		explorationParameter = config.get('mcts.explorationParameter') ,
		infinity = config.get('mcts.infinity') ,
		helper = require('./knowledgeBase.helper.js');


	/**
	 * gets a board node from neo4j by its index
	 * @param  {Number} index  - a hash value generated by knowledgeBase.helper.hash
	 * @return {Object}        - neo4j BOARD object
	 */
	function getNode(index) {
		var deferred = Q.defer();

		neo4j({json: helper.constructQueryBody(`MATCH(p : BOARD {index: ${index}}) RETURN p`)},
			function(err, res, body) {
				if (err) {
					deferred.reject(new Error('[knowledgeBase.getNode()]: request resulted in error: \n' + JSON.stringify(err)));
				}
				var result = _.get(body, 'results[0].data[0].row[0]');
				deferred.resolve(result);
			});

		return deferred.promise;
	}

	/**
	 * gets or creates a board node object
	 * @param  {Object} board  - generalized board object
	 * @return {Promise}       - resolves to a treeNode object, or error
	 */
	function mergeNode(board) {
		var deferred = Q.defer() ,
			serializedBoard = helper.serialize(board) ,
			hashBoard = helper.hash(serializedBoard) ,
			query = [
					`
						MERGE(p : BOARD {index: ${hashBoard}})
						ON CREATE SET p.nonTerminal = true, p.rewards = 0, p.visits = 0, p.createdAt = timestamp(), p.board = '${serializedBoard}'
						RETURN p
					`,
					`
						MATCH(p : BOARD {index: ${hashBoard}}) - [a: POSSIBLE] - ()
						RETURN a
					`] ,

			payload = helper.constructQueryBody(query, [{},{}]);
		neo4j({json: payload},
			function(err, res, body) {
				var neo4jError = _.get(body, 'errors')
					,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('mergeNode', body) : null);
				if (errors) {
					console.log('errors');
					deferred.reject(errors);
				} else {
					var resultBoard = _.get(body, 'results[0].data[0].row[0]');

					// TODO: implement branch that handles the case that we are at some board state which does not yet exist in the knowledge base
						// , actionData = _.get(body, 'results[1].data')
						// , actions = []
					// console.log('returned from neo4j with results, board, actiondata')
					// console.log(actionData)
					// _.forEach(actionData, function(d) {
					// 	console.log('d')
					// 	console.log(d)
					// 	var	thisAction = _.get(d, 'row[0]')
					// 	if (thisAction) {
					// 		actions.push(thisAction)
					// 	}
					// })
					// var needToExpand = (actions.length > 0 ? false : true);
					// if (needToExpand) {
						// @todo: if actions.length > 0, expand().then(function(){ createChildren().then(function() { deferred.resolve() }) })
						// this is how we deal with the situation where a new node is created. it will not yet have
						// any possibleMoves.  we need to expand it and then create it's children then finally return
						// the board.
					// }
					deferred.resolve(resultBoard);  // @todo: all entities in boards[] should be identical. check by _.uniq()?
				}
			});
		return deferred.promise;
	}

	/**
	 * creates a root node in the knowledge base
	 * @param  {Object[]} moves     - array of valid moves from state
	 * @param  {TreeNode} board     - game board object (should be generated via variant.generate())
	 * @return {Promise}            - Promise that returns the created root node on success
	 */
	function createNewRoot(board, moves) {
		var deferred = Q.defer();
		// @todo: validate board instanceof BoardObject.  likely a function attached to variant.
		// in order to do this, variant would need to be a singleton and shared to all
		// node code.  :-(
		if (!typeof board === 'object') {
			deferred.reject(new Error('[knowledgeBase.createNewRoot()]: board (arg1) should be an object'));
			return deferred.promise;
		} else
	  if (!Array.isArray(moves)) {
	  	deferred.reject(new Error('[knowledgeBase.createNewRoot()]: arg 2 ("moves") should be an array'));
	  	return deferred.promise;
	  } else {
	  	var possibleMoves = [];
	  	_.forEach(moves, function(move) {
	  		var moveData = {};
	  		moveData.move = move;
	  		moveData.unexploredIndex = helper.serializeAction(move);
	  		possibleMoves.push(moveData);
	  	});
	  	var serializedBoard = helper.serialize(board) ,
	  		hashBoard = helper.hash(serializedBoard) ,
				params = {
					boardParams: {
						nonTerminal: true,
						index: hashBoard,
						board: serializedBoard,
						rewards: 0,
						visits: 0,
						createdAt: Date.now()
					},
					possibleMoves: possibleMoves,

				}
				// @TODO: check if already exists, and just return it.
				, statement = `
						MERGE(p : BOARD {index: ${hashBoard}})
						ON CREATE SET p.nonTerminal = true, p.rewards = 0, p.visits = 0, p.createdAt = timestamp(), p.board = '${serializedBoard}'
						FOREACH(moveData in {possibleMoves} |
			 		  	MERGE(p) - [: POSSIBLE {name: moveData.move.name, params: moveData.move.params}] - > (n : UNEXPLORED {index: moveData.unexploredIndex}))
				 		RETURN p`
				,	payload = helper.constructQueryBody(statement, params);
			neo4j({json: payload}, function(err, res, body) {
				var neo4jError = _.get(body, 'errors')
					,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('createNewRoot', body) : null);
				if (errors) {
					deferred.reject(errors);
				} else {
					// var result = {};
					// result.root = _.get(body, 'results[0].data[0].row[0]');  // parses neo4j response structure
					deferred.resolve(body);
				}
			});
		}
		return deferred.promise;
	}

	/**
	 * database settings
	 * @return {Promise}  - nothing useful beyond success/failure callbacks being called.
	 */
	function configureDatabase() {
		var deferred = Q.defer() 
		,	statements = [
	 	 // `CREATE INDEX ON :BOARD(index)`
	 	 `CREATE CONSTRAINT ON (b:BOARD) ASSERT b.index IS UNIQUE`
		]
		, params = [
			{}
		]
		, payload = helper.constructQueryBody(statements,params);
		neo4j({json: payload}, function(err, res, body) {
			var neo4jError = _.get(body, 'errors')
				,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('createNewRoot', body) : null);
			if (errors) {
				deferred.reject(errors);
			} else {
				deferred.resolve(body);
			}			
		})
		return deferred.promise;
	}

	/**
	 * creates children of a parent node by way of the move that generated them.  called after simulation.expand()
	 * @param  {TreeNode} parent                 - parent node (a BOARD properties object, aka TreeNode)
	 * @param  {Number}   parent.index           - hash value of existing parent object in database
	 * @param  {Object}   move                   - a valid move object (see wiki for example)
	 * @param  {Object[]} children               - generalized board objects, the result of simulation.expand()
	 * @param  {String}   children[].board       - child board state
	 * @param  {Object[]} children[].moves       - valid moves from the child state
	 * @param  {Boolean}  children[].nonTerminal - flag indicating it is an end of game configuration
	 * @return {Promise}                         - resolves to 'success', else it will reject
	 */
	function createChildren(parent, move, children) {
		// TODO: input validation
		if (!typeof parent === 'object' && !parent.hasOwnProperty('index')) {
			deferred.reject('[knowledgeBase.createChildren()]: parent (arg1) should be an object with an index property, got: ' + JSON.stringify(parent));
			return deferred.promise;
		} else if (!typeof move === 'object') {
			deferred.reject('[knowledgeBase.createChildren()]: move (arg2) should be an object');
			return deferred.promise;
		} else if (!Array.isArray(children)) {
			deferred.reject('[knowledgeBase.createChildren()]: children (arg3) should be an array');
			return deferred.promise;
		} else {
			var deferred = Q.defer() ,
				statements = [] ,
				parameters = [] ,
				hashParentBoard = parent.index;

			_.forEach(children, function(child) {
				let thisBoard = _.get(child, 'board');
				if (!thisBoard) {
					throw new Error('[knowledgeBase.createChildren()]: a child in children is missing board property: \n' + JSON.stringify(child));
				}
				var possibleMoves = [];
		  	_.forEach(child.actions, function(move) {
		  		var moveData = {};
		  		moveData.move = move;
		  		moveData.unexploredIndex = helper.serializeAction(move);
		  		possibleMoves.push(moveData);
		  	});
				let serializedBoard = helper.serialize(child.board) ,
	  			hashChildBoard = helper.hash(serializedBoard) ,
	  			params = {
							nonTerminal: (child.actions.length > 0),
							index: hashChildBoard,
							possibleMoves: possibleMoves,
							move: move
					}
					, nonTerminal = (possibleMoves > 0) ,
					query = `
							MERGE(c:BOARD {index: {index}})
							ON CREATE SET c.nonTerminal = {nonTerminal}, c.rewards = 0, c.visits = 0, c.createdAt = timestamp(), c.board = '${serializedBoard}'
							WITH c
							WHERE NOT(c)-[:UNEXPLORED|CHILD]-()
							FOREACH(moveData in {possibleMoves} |
								CREATE(n:UNEXPLORED {index: moveData.unexploredIndex})
					 		  CREATE(c)-[:POSSIBLE {name: moveData.move.name, params: moveData.move.params}]->(n))
				 		  WITH c
							MATCH(p:BOARD {index: ${hashParentBoard}})
							WITH c, p
							CREATE(p)-[cr:CHILD {move}]->(c)
							CREATE(c)-[pr:PARENT {move}]->(p)
							RETURN collect(c) AS result`
				statements.push(query);
				parameters.push(params);
			});
			// delete 'possible' relation associated with this 'create' call
			parameters.push({
				move: {
					object: move,
					index: helper.serializeAction(move)
				}
			});
			statements.push(`
				WITH {move} AS m
				MATCH(p:BOARD {index: ${hashParentBoard}}) - [r {name: m.object.name}] - (u:UNEXPLORED {index: m.index})
				DELETE r, u
			`);

			var payload = helper.constructQueryBody(statements, parameters);
			// debug
			// deferred.reject(new Error('createChildren payload: ' + JSON.stringify(payload)))
			neo4j({json: payload}, function(err, response, body) {
				var neo4jError = _.get(body, 'errors') 
					,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('createChildren', body) : null);
				if (errors) {
					deferred.reject(errors);
				} else {
					var result = [] ,
						childCount = _.get(body, 'results.length');
					for (var i = 0; i < childCount; ++i) {
						var child = {};
						// TODO: create helper to parse neo4j response object (or find one)
						child = _.get(body, 'results[' + i + '].data[0].row[0]');
						result.push(child);
					}
					deferred.resolve(result);
				}
			});
			return deferred.promise;
		}
	}


	/**
	 * backup operation for Monte Carlo Tree Search
	 * @param  {Object} child        - child generalized board state we will backup from
	 * @param  {Number} rootBoard    - root board, from variant.rootNodeData()
	 * @param  {1|0} reward          - delta reward calculated by simulation.defaultPolicy()
	 * @return {Promise}             - string 'success' or error object if failed
	 */
	function backup(child, rootBoard, reward) {
		var deferred = Q.defer();
		if ((typeof (Number.parseInt(reward))) !== 'number') {
			deferred.reject(new Error('[knowledgeBase.backup]: reward ' + JSON.stringify(reward) + ' is not a number'));
		} else if (typeof child !== 'object') {
			deferred.reject(new Error('[knowledgeBase.backup]: child state: "' + (typeof child) + '" should be an object.'));
		} else if (typeof rootBoard !== 'object') {
			deferred.reject(new Error('[knowledgeBase.backup]: root state: "' + (typeof rootBoard) + '" should be an object.'));
		} else {
			var hashChildBoard = helper.hash(helper.serialize(child)) ,
				hashRootBoard = helper.hash(helper.serialize(rootBoard)),
				query = `
						MATCH(child : BOARD{index: ${hashChildBoard}}), (root : BOARD {index: ${hashRootBoard}}),
						path = (child) - [:PARENT *] - > (root)
						WITH nodes(path) AS pathNodes UNWIND pathNodes as node
						WITH DISTINCT node
						SET node.visits = node.visits + 1, node.rewards = node.rewards + ${reward}`,
				payload = helper.constructQueryBody(query);
			// console.log('[backup]: backing up from index ' + hashChildBoard + ' to root index ' + hashRootBoard + '.')
			neo4j({json: payload}, function(err, response, body) {
				var neo4jError = _.get(body, 'errors')
					,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('backup', body) : null);
				if (errors) {
					deferred.reject(JSON.stringify(errors));
				} else {
					deferred.resolve('success');
				}
			});
		}
		return deferred.promise;
	}

	/**
	 * bestChild operation in Monte Carlo Tree Search, using UCT method. finds the bestChild of a parent board and returns it along with the move that creates the child
	 * @param  {Object} parent - TreeNode of parent
	 * @param  {Integer}    Cp - the coefficient used in UCT for the second term. See essay on MCTS methods.
	 * @return {Promise}       - Promise that resolves to a tuple of board state object, move object; or, an error
	 */
	function bestChild(parent, Cp) {
		var deferred = Q.defer() ,
			index = parent.index;
		if (!index) {
			throw new Error('[knowledgeBase.bestChild()]: no index on incoming parent object: \n' + JSON.stringify(parent));
		}
		var query = `
					MATCH(p:BOARD {index: ${index}}) - [r:CHILD] - > (c:BOARD)
					WITH collect(c) AS children, r AS moves, p AS parent
					RETURN EXTRACT(child in children |
							CASE
							WHEN child.visits = 0
							THEN {board: child.board, nonTerminal: child.nonTerminal, index: child.index, uct: ${infinity}}
							ELSE {
					      board: child.board,
					      nonTerminal: child.nonTerminal,
					      index: child.index,
					      uct:
					      	((toFloat
					      			(child.rewards) / child.visits) +
					       		${Cp}
					       			* SQRT(
					        			(2.0 * LOG(parent.visits)) /
					        		child.visits)
					       		)
					    }
				  	END)
			  	AS uct, moves`
					// TODO: within query, "ORDER BY uct DESC LIMIT 1"
		var payload = helper.constructQueryBody(query);
		neo4j({json: payload}, function(err, response, body) {
			var neo4jError = _.get(body, 'errors')
					,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('bestChild', body) : null);
			if (errors) {
				deferred.reject(body);
			} else {
				var result = [] ,
					childCount = _.get(body, 'results[0].data.length');
				for (var i = 0; i < childCount; ++i) {
					var child = {};
					// TODO: create helper to parse neo4j response object (or find one)
					child.board = _.get(body, 'results[0].data[' + i + '].row[0][0]');
					child.move = _.get(body, 'results[0].data[' + i + '].row[1]');
					result.push(child);
				}

				result.sort(function(a, b) {
					return b.board.uct - a.board.uct;
				});

				// if (Cp != 0) {
				// 	console.log('bestChild result with cp = ' + Cp + ':')
				// 	console.log(result)
				// }

				var bestChild = _.head(result);
				if (!bestChild) {
					throw new Error('[knowledgeBase.bestChild()]: neo4j returned result but it did not contain the expected structure: \n' + JSON.stringify(body) + '\n');
				}
				deferred.resolve(bestChild);
			}
		});
		return deferred.promise;
	}


	/**
	 * treePolicy method as described in Monte Carlo Tree Search. searches for a best child board state to pass to our defaultPolicy for simulation.
	 * @param  {Object}  root           - tree node for the root of this treePolicy search
	 * @param {Object}   variant        - game variant
	 * @param {Function} variant.expand - returns the list of possible child board states and their possible moves
	 * @return {Promise}                - resolves to a board state object, rejects with any error messages.
	 */
	function treePolicy(root, variant) {
		if (!_.has(variant, 'expand')) {
			throw new Error('[treePolicy]: variant (arg2) is missing an expand property');
		}
		console.log('[treePolicy]: entering treePolicy.')
		var deferred = Q.defer() ,
			v = root,
			expandableMoveNotFound = true;
		async.doWhilst(function(callback) {
			console.log('[treePolicy]: top of doWhilst loop for index ' + v.index)
			var query = `
				MATCH(b:BOARD {index: ${v.index}}) - [r:POSSIBLE] - > ()
				WITH r, count(*) as possibleMoveCount
				RETURN
				CASE possibleMoveCount > 0
				WHEN true
				THEN r
				WHEN false
				THEN false
				END AS expand`,
			payload = helper.constructQueryBody(query);
			neo4j({json: payload}, function(err, _res, body) {
				var neo4jError = _.get(body, 'errors')
					,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('treePolicy', body) : null);
				if (errors) {
					callback(errors);
				} else {
					console.log('[treePolicy]: in doWhilst, completed neo4j call to get possibleMoves|false:')
					// grab first move. order guaranteed? not guaranteed? probs not.
					var move = _.get(body, 'results[0].data[0].row[0]');
					console.log(move)
					if (move) {
						expandableMoveNotFound = false;  // end async.whilst() loop
						var parentBoardToExpand = JSON.parse(v.board);
						console.log('[treePolicy]: found a move.  calling expand above move on parentBoard, move:')
						console.log(parentBoardToExpand)
						console.log(move)
						parentBoardToExpand.Steps = config.get('clips.Steps')  // required by clips.expand()
						variant.expand(parentBoardToExpand, move)
							.then(function(children) {
								// TODO: remove Steps from the contract on generalizedBoards - steps should not be part of
								// what is used to generate indices in the graph
								_.forEach(children, function(child) {
									_.unset(child, 'board.Steps');
								})
								console.log('expand result')
								console.log(JSON.stringify(children))
								console.log('[treePolicy]: returned from expand(), calling createChildren()')
								createChildren(v, move, children)
									.then(function(result) {
										// @TODO: confirm that we are always grabbing the result from createChildren.
										// the neo4j response structure is always an array due to collect(c);
										// but is it ever multiple arrays in multiple rows due to possible multiplicity
										// of children generated?
										console.log('[treePolicy]: returned from createChildren(). createChildren result, new v:')
										console.log(result)										
										v = _.head(_.head(result));
										console.log(v)
										if (!v) {
											let len = _.get(children, 'length');
											throw new Error('[treePolicy]: created children from ' + len + ' children but _.head() of result from createChildren() is falsey:\n' + JSON.stringify(v));
										}
										callback(null); // doWhilst(): end this iteration
									})
									.catch(function(createError) {
										callback(createError);
									});
							});
					} else {
						console.log('[treePolicy]: didn\'t find a move. calling bestChild() with v, Cp:')
						console.log(v)
						console.log(explorationParameter)
						bestChild(v, explorationParameter)
							.then(function(vBestChild) {
								console.log('[treePolicy]: returned from bestChild(). setting new "v" to:')
								v = vBestChild.board;
								console.log(v)
								if (v) {
									callback(null);
								} else {
									callback(new Error('[treePolicy]: could not look up board state string of bestChild() with v: ' + JSON.stringify(v) + ' from bestChild result: \n ' + JSON.stringify(vBestChild)));
								}
							})
							.catch(function(bestChildError) {
								callback(bestChildError);
							});
						// copied from bestChild() above (before refactoring to not set c.uct)
					}
				}
			});
		},
		function whileTest() {
			// console.log('[treePolicy]: whiteTest of doWhilst loop for index ' + v.index)
			// console.log('[treePolicy]: whileTest is ' + (expandableMoveNotFound && v.nonTerminal))
			return (expandableMoveNotFound && v.nonTerminal);
		},
		function result(error, result) {
			if (error) {
				deferred.reject(error);
			} else {
				// console.log('[treePolicy]: done with board:')
				// console.log(helper.deserialize(v.board))
				deferred.resolve(helper.deserialize(v.board));
			}
		});
  	return deferred.promise;
	}
}
