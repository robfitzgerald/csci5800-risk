// an abstraction of neo4j calls
// a wrapper for cypher queries and the request module
'use strict';
{
	module.exports = {
		createNewRoot,
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

	var config = require('config')
		, auth = new Buffer(config.get('neo4j.username') + ':' + config.get('neo4j.password'))
		, request = require('request')
		, _ = require('lodash')
		, Q = require('q')
		, async = require('async')
		, CLIPS = require('../lib/clipsController.js')
		, neo4jParser = require('neo4j-parser')
		, neo4j = request.defaults({
			method: 'POST',
			url: config.get('neo4j.baseUrl'),
			headers: {
				Authorization: 'Basic ' + auth.toString('base64')
			}
		})
		, explorationParameter = config.get('mcts.explorationParameter')
		, infinity = config.get('mcts.infinity')
		, helper = require('./knowledgeBase.helper.js')

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
	  	var serializedBoard = helper.serialize(board)
	  		, hashBoard = helper.hash(serializedBoard)
				, params = {
					boardParams: {
						nonTerminal: true,
						index: hashBoard,
						board: serializedBoard,
						rewards: 0,
						visits: 0,
						createdAt: Date.now()
					},
					possibleMoves: moves
				}
				, statement = `
						CREATE (p:BOARD {boardParams})
						WITH p
						FOREACH (move in {possibleMoves} | 
							CREATE (n:UNEXPLORED {index: ${hashBoard}})
				 		  CREATE (p) -[:POSSIBLE {name: move.name, params: move.params}]-> (n))
				 		RETURN p`
				, payload = helper.constructQueryBody(statement, params)
			neo4j({json:payload}, function(err, res, body) {
				var neo4jError = _.get(body, 'errors')
					, errors = err || ((neo4jError.length > 0) ? neo4jError : null);
				if (errors) {
					deferred.reject(errors);
				} else {
					var result = {};
					result.root = _.get(body, 'results[0].data[0].row[0]')  // parses neo4j response structure
					deferred.resolve(result)
				}
			});
		}
		return deferred.promise;
	}

	/**
	 * creates children of a parent node by way of the move that generated them.  called after simulation.expand()
	 * @param  {TreeNode} parent                - parent node
	 * @param  {Object} move                    - a valid move object (see wiki for example)
	 * @param  {Object[]} children              - generalized board objects, the result of simulation.expand()
	 * @param  {String} children[].board        - child board state
	 * @param  {Object[]} children[].moves      - valid moves from the child state
	 * @param  {Boolean} children[].nonTerminal - flag indicating it is an end of game configuration
	 * @return {Promise}                        - resolves to 'success', else it will reject 
	 */
	function createChildren(parent, move, children) {
		// TODO: input validation
		if (!typeof parent === 'object') {
			deferred.reject('[knowledgeBase.createChildren()]: parent (arg1) should be an object');
			return deferred.promise;
		} else if (!typeof move === 'object') {
			deferred.reject('[knowledgeBase.createChildren()]: move (arg2) should be an object');
			return deferred.promise;
		} else if (!Array.isArray(children)) {
			deferred.reject('[knowledgeBase.createChildren()]: children (arg3) should be an array');
			return deferred.promise;
		} else {
			var deferred = Q.defer()
				, statements = []
				, parameters = []
				, hashParentBoard = helper.hash(parent);

			_.forEach(children, function(child) {
				let thisBoard = _.get(child, 'board');
				if (!!thisBoard) {
					throw new Error('[knowledgeBase.createChildren()]: a child in children is missing board property: \n' + JSON.stringify(child));
				}
				let serializedBoard = helper.serialize(child.board)
	  			, hashChildBoard = helper.hash(child.board)
	  			, params = {
						child: {
							nonTerminal: child.nonTerminal,
							index: hashChildBoard,
							board: serializedBoard,
							rewards: 0,
							visits: 0,
							createdAt: Date.now()
						},
						possibleMoves: child.moves,
						move: move
					}
					, query = `
							CREATE (c:BOARD {child})
							WITH c
							FOREACH (move in {possibleMoves} | 
								CREATE (n:UNEXPLORED {index: ${hashChildBoard}})
					 		  CREATE (c) -[:POSSIBLE {name: move.name, params: move.params}]-> (n))
				 		  WITH c
							MATCH (p:BOARD {index: ${hashParentBoard}})
							WITH c, p
							CREATE (p) -[cr:CHILD {move}]-> (c)
							CREATE (c) -[pr:PARENT {move}]-> (p)
							RETURN c`
				statements.push(query);
				parameters.push(params);
			})
			// delete 'possible' relation associated with this 'create' call
			statements.push(`
				WITH {move} AS m
				MATCH (p:BOARD {index: ${hashParentBoard}}) -[r {name: m.name}]- (u:UNEXPLORED {index:${hashParentBoard}})
				DELETE r, u
			`)		
			parameters.push({move: move})

			var payload = helper.constructQueryBody(statements, parameters)
			// console.log(JSON.stringify(payload))
			neo4j({json:payload}, function(err, response, body) {
				var neo4jError = _.get(body, 'errors')
					, errors = err || ((neo4jError.length > 0) ? neo4jError : null);
				if (errors) {
					deferred.reject(errors);
				} else {
					var result = []
						, childCount = _.get(body, 'results.length')
					for (var i = 0; i < childCount; ++i) {
						var child = {};
						// TODO: create helper to parse neo4j response object (or find one)
						child = _.get(body, 'results[' + i + '].data[0].row[0]');
						result.push(child)
					}
					deferred.resolve(result)
				}
			})
			return deferred.promise;
		}
	}


	/**
	 * backup operation for Monte Carlo Tree Search
	 * @param  {Object} child        - child board state we will backup from
	 * @param  {String} root         - root board state, from variant.generate()
	 * @param  {Integer} reward      - delta reward calculated by simulation.defaultPolicy()
	 * @return {Promise}             - string 'success' or error object if failed
	 */
	function backup(child, root, reward) {
		var deferred = Q.defer()
		if (typeof reward !== 'number') {
			deferred.reject(new Error('[knowledgeBase.backup]: reward ' + reward + ' is not a number'));
			return deferred.promise;
		} else if (typeof child !== 'object' || typeof root !== 'object') {
			deferred.reject(new Error('[knowledgeBase.backup]: child state: "' + (typeof child) + '", root state: "' + (typeof root) + '". both should be objects.'))
			return deferred.promise;
		} else {
			var hashChildBoard = helper.hash(helper.serialize(child))
				, hashRootBoard = helper.hash(helper.serialize(root))
				, query = `
						MATCH (child:BOARD{index: ${hashChildBoard}}),(root:BOARD {index: ${hashRootBoard}}),
						path = (child) -[:PARENT*]-> (root)
						WITH nodes(path) AS pathNodes UNWIND pathNodes as node
						WITH DISTINCT node
						SET node.visits = node.visits + 1, node.rewards = node.rewards + ${reward}
						RETURN collect(node)`
				, payload = helper.constructQueryBody(query)
			neo4j({json:payload}, function(err, response, body) {
				var neo4jError = _.get(body, 'errors')
					, errors = err || ((neo4jError.length > 0) ? neo4jError : null);
				if (errors) {
					deferred.reject(errors);
				} else {
					deferred.resolve('success')
				}
			})
			return deferred.promise;
		}
	}

	/**
	 * bestChild operation in Monte Carlo Tree Search, using UCT method. finds the bestChild of a parent board and returns it along with the move that creates the child
	 * @param  {Object} parent - parent board state object
	 * @param  {Integer}    Cp - the coefficient used in UCT for the second term. See essay on MCTS methods.
	 * @return {Promise}       - Promise that resolves to a tuple of board state object, move object; or, an error
	 */
	function bestChild(parent, Cp) {
		var deferred = Q.defer()
			, hashParentBoard = helper.hash(helper.serialize(parent))
			, query = `
					MATCH (p:BOARD {index:${hashParentBoard}}) -[r:CHILD]-> (child:BOARD)
					WITH collect(child) AS children, r AS moves, p AS parent
					RETURN EXTRACT(board in children |
							CASE 
							WHEN board.visits = 0
							THEN {state:board.state, nonTerminal: board.nonTerminal, uct: ${infinity}}						
							ELSE {
					      state: board.state, 
					      nonTerminal: board.nonTerminal,
					      uct: 
					      	((toFloat
					      			(board.rewards) / board.visits)
					       		+ ${Cp}
					       			* SQRT(
					        			(toFloat(2 * LOG(parent.visits)))
					        		/ board.visits)
					       		)
					    }
				  	END)
			  	AS uct, moves`
					// TODO: within query, "ORDER BY uct DESC LIMIT 1"
		var payload = helper.constructQueryBody(query)
		neo4j({json:payload}, function(err, response, body) {
			var neo4jError = _.get(body, 'errors')
				, errors = err || ((neo4jError.length > 0) ? neo4jError : null);
			if (errors) {
				deferred.reject(errors);
			} else {
				var result = []
					, childCount = _.get(body, 'results[0].data.length')
				for (var i = 0; i < childCount; ++i) {
					var child = {};
					// TODO: create helper to parse neo4j response object (or find one)
					child.board = _.get(body, 'results[0].data[' + i + '].row[0][0]');
					child.move = _.get(body, 'results[0].data[' + i + '].row[1]');
					result.push(child)
				}
				result.sort(function(a,b) {
					return b.board.uct - a.board.uct;
				})
				// deferred.resolve(_.get(result, '[0]'))
				deferred.resolve(result)
			}
		})
		return deferred.promise;
	}


	/**
	 * treePolicy method as described in Monte Carlo Tree Search. searches for a best child board state to pass to our defaultPolicy for simulation.
	 * @param  {Object} root - root state string for the tree we are exploring
	 * @return {Promise}     - resolves to a board state object, rejects with any error messages.
	 */
	function treePolicy(root) {
		var deferred = Q.defer()
			, serializedRoot = helper.serialize(root)
			, indexRoot = helper.hash(serializedRoot)
			, v = {index:indexRoot,nonTerminal:true}
			, expandableMoveNotFound = true;
		async.doWhilst(function(callback) {
			var query = `
				MATCH (b:BOARD {index:${v.index}}) -[r:POSSIBLE]-> ()
				WITH r, count(*) as possibleMoveCount
				RETURN
				CASE possibleMoveCount > 0
				WHEN true
				THEN r
				WHEN false 
				THEN false
				END AS expand`
			, payload = helper.constructQueryBody(query)
			neo4j({json:payload}, function(err, _res, body) {
				var neo4jError = _.get(body, 'errors')
					, errors = err || ((neo4jError.length > 0) ? neo4jError : null);
				if (errors) {
					callback(errors);
				} else {
					// grab first move. order guaranteed? not guaranteed? probs not.
					var move = _.get(body, 'results[0].data[0].row[0]')
					// console.log('move')
					// console.log(JSON.stringify(move))
					if (move) {
						expandableMoveNotFound = false;
						CLIPS.expand(v, move)
							.then(function(children) {
								// console.log('[treePolicy] CLIPS.expand() result: ')
								// console.log(children)
								createChildren(v, move, children)
									.then(function(result) {
										// console.log('createChildren() result: ')
										// console.log(result)
										// console.log('[treePolicy]: picking the first createdChild in order to '
											// + 'provide defaultPolicy() with only one board to simulate.')
										v = _.head(result);
										if (!v) {
											let len = _.get(children, 'length')
											throw new Error('[knowledgeBase.treePolicy()]: created children from ' + len + ' children but _.head() of result from createChildren() is falsey.')
										}
										// console.log('[treePolicy] create new child result:')
										// console.log(result)
										callback(null) // doWhilst(): end this iteration
									})
									.catch(function(createError) {
										// console.log('[treePolicy] error from createChild() call:' + createError)
										callback(createError)
									})
							})
					} else {
						// console.log('bestChild()')
						// console.log(v)
						// console.log(explorationParameter)
						bestChild(v, explorationParameter)
							.then(function(vBestChild) {
								v = _.get(vBestChild, 'board')
								if (v) {
									// console.log('bestChild() result aka "v": ')
									// console.log(v)
									callback(null)
								} else {
									callback(new Error('[treePolicy]: could not look up board state string of bestChild() with v: ' + JSON.stringify(v) + ' from bestChild result: \n ' + JSON.stringify(vBestChild)))
								}		
							})
							.catch(function(bestChildError) {
								callback(bestChildError)
							})
						// copied from bestChild() above (before refactoring to not set c.uct)
					}
				}
			})
		},
		function whileTest () { return expandableMoveNotFound && v.nonTerminal;},
		function result (error, result) {
			if (error) {
				deferred.reject(error);
			} else {
				deferred.resolve(v)
			}
		})
  	return deferred.promise;
	}	  	
}