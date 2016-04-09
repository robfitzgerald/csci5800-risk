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
	 * @param  {Object[]} moves     - array of valid moves     from state
	 * @param  {String} boardString - game boardString name - becomes root state name
	 * @return {Promise}            - Promise that returns the created root node on success
	 */
	function createNewRoot(boardString, moves) {
		var deferred = Q.defer();
	  if (!typeof boardString === 'string') {
	  	deferred.reject('[knowledgeBase.createNewRoot]: arg 1 ("boardString") should be a string, got ' + JSON.stringify(boardString));
	  	return deferred.promise;
	  } else if (!Array.isArray(moves)) {
	  	deferred.reject('[knowledgeBase.createNewRoot]: arg 2 ("moves") should be an array')
	  	return deferred.promise;
	  } else {
	  	var serializedBoard = helper.serialize(boardString)
				, params = {
					boardParams: {
						nonTerminal: true,
						state: serializedBoard,
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
							CREATE (n:UNEXPLORED {state: '${serializedBoard}'})
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
	 * creates children of a parent node by way of the move that generated them
	 * @param  {String} parent                  - serialized parent board
	 * @param  {Object} move                    - a valid move object (see wiki for example)
	 * @param  {Object[]} children              - contains data used to create each child board object
	 * @param  {String} children[].state        - child board state
	 * @param  {Object[]} children[].moves      - valid moves from the child state
	 * @param  {Boolean} children[].nonTerminal - flag indicating it is an end of game configuration
	 * @return {Promise}                        - resolves to 'success', else it will reject 
	 */
	function createChildren(parent, move, children) {
		// TODO: input validation
		if (!typeof parent === 'string') {
			deferred.reject('[knowledgeBase.createChild] error: parent (arg1) should be a string');
			return deferred.promise;
		} else if (!typeof move === 'object') {
			deferred.reject('[knowledgeBase.createChild] error: move (arg2) should be an object');
			return deferred.promise;
		} else if (!Array.isArray(children)) {
			deferred.reject('[knowledgeBase.createChild] error: children (arg3) should be an array');
			return deferred.promise;
		} else {
			var deferred = Q.defer()
				, statements = []
				, parameters = [];
			_.forEach(children, function(child) {
				let params = {
						child: {
							nonTerminal: child.nonTerminal,
							state: child.state,
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
								CREATE (n:UNEXPLORED {state: '${child.state}'})
					 		  CREATE (c) -[:POSSIBLE {name: move.name, params: move.params}]-> (n))
				 		  WITH c
							MATCH (p:BOARD {state: '${parent}'})
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
				MATCH (p:BOARD {state: '${parent}'}) -[r {name: m.name}]- (u:UNEXPLORED {state:'${parent}'})
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
	 * @param  {String} child        - child board string we will backup from
	 * @param  {String} root         - root board string (board state before game begins)
	 * @param  {Integer} reward      - delta reward calculated by defaultPolicy
	 * @return {'success' | Object}  - error object if failed
	 */
	function backup(child, root, reward) {
		var deferred = Q.defer()
		if (typeof reward !== 'number') {
			deferred.reject('[knowledgeBase.backup] error: reward ' + reward + ' is not a number');
			return deferred.promise;
		} else if (typeof child !== 'string' || typeof root !== 'string') {
			deferred.reject('[knowledgeBase.backup] error: child state string: "' + child + '", root state string: "' + root + '". both should exist.')
			return deferred.promise;
		} else {
			var serializedChild = helper.serialize(child)
				, serializedRoot = helper.serialize(child)
				, query = `
						MATCH (child:BOARD{state: '${serializedChild}'}),(root:BOARD {state: '${serializedRoot}'}),
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
	 * @param  {String} parent - parent board state string
	 * @param  {Integer}    Cp - the coefficient used in UCT for the second term. See essay on MCTS methods.
	 * @return {Promise}       - Promise that resolves to a tuple of board state object, move object
	 */
	function bestChild(parent, Cp) {
		var deferred = Q.defer()
			, query = `
					MATCH (p:BOARD {state:'${parent}'}) -[r:CHILD]-> (child:BOARD)
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
				deferred.resolve(_.get(result, '[0]'))
			}
		})
		return deferred.promise;
	}


	/**
	 * treePolicy method as described in Monte Carlo Tree Search. searches for a best child board state to pass to our defaultPolicy for simulation.
	 * @param  {String} root - root state string for the tree we are exploring
	 * @return {Promise}     - resolves to a board state object, rejects with any error messages.
	 */
	function treePolicy(root) {
		var deferred = Q.defer()
			, serializedRoot = helper.serialize(root)
			, v = {state:serializedRoot,nonTerminal:true}
			, expandableMoveNotFound = true;
		async.doWhilst(function(callback) {
			var query = `
				MATCH (b:BOARD {state:'${v.state}'}) -[r:POSSIBLE]-> ()
				WITH r, count(*) as possibleMoveCount
				RETURN
				CASE possibleMoveCount > 0
				WHEN true
				THEN r
				WHEN false 
				THEN false
				END AS expand
			`
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
						CLIPS.expand(v.state, move)
							.then(function(children) {
								// console.log('[treePolicy] CLIPS.expand() result: ')
								// console.log(children)
								createChildren(v.state, move, children)
									.then(function(result) {
										// console.log('createChildren() result: ')
										// console.log(result)
										// console.log('[treePolicy]: picking the first createdChild in order to '
											// + 'provide defaultPolicy() with only one board to simulate.')
										v = result[0];
										// console.log('[treePolicy] create new child result:')
										// console.log(result)
										callback(null)
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
						bestChild(v.state, explorationParameter)
							.then(function(vBestChild) {
								v = _.get(vBestChild, 'board')
								// console.log('v is now ' + v.state + ', nonTerminal = ' + v.nonTerminal);
								// console.log(v)
								if (v) {
									// console.log('bestChild() result aka "v": ')
									// console.log(v)
									callback(null)
								} else {
									callback('[treePolicy]: could not look up board state string of bestChild().')
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



	// backup({state:'sloop'}, null, 1)
	// 	.then(function(res){ console.log(JSON.stringify(res)); })
	// 	.catch(function(err) { console.log(err) })
	// console.log(helper.deserializeBoard('puppies'))
	// console.log(helper.serializeBoard('sloop'))
	// bestChild('betsy', 0)
	// 	.then(function(res) { console.log(JSON.stringify(res))})
	// 	.catch(function(err) { console.log(err)})
	// debugGenerateTestChildren(2, '55555');
	

	// ---TEST---
	// createNewRoot('betsy', [{name:'moves', params: ["asdf","sdfg","dfgh","fghj"]}, {name:'flooves', params: []}, {name:'shuld be not takey', params: []}])
	//  	.then(function(res) { 
	//  		// console.log('createNewRoot.then()')
	//  		// console.log(res)
	//  		createChildren('betsy', {name:'moves', params: ["asdf","sdfg","dfgh","fghj"]}, 
	//  			[
	// 		 		{
	// 		 			state: 'ronnie',
	// 		 			moves: [{name:'asdf', params: ["asdf","sdfg","dfgh","fghj"]}],
	// 		 			nonTerminal: true
	// 		 		},{
	// 		 			state: 'zuko',
	// 		 			moves: [{name:'fghah', params: []}],
	// 		 			nonTerminal: true
	// 		 		}
	// 	 		])
	//  			.then(function(res2) {
	//  				// console.log('createChildren.then()')
	//  				// console.log(res2)
	// 				treePolicy('betsy')
	// 					.then(function(res) {
	// 						// console.log('treePolicy success');
	// 						// console.log(JSON.stringify(res))
							// var i = 0
							// 	, generate = 5
							// 	, counter = Date.now();	
							// async.whilst(function() { return i < generate }
							// 	, function(callback) {
							// 		i++;
							// 		treePolicy('betsy')
							// 			.then(function(res) { console.log('treePolicy result: '); console.log(res); callback(null, res)})
							// 			.catch(function(err) { callback(err)})
							// 	},
							// 	function(error, result) {
							// 		console.log(generate + ' done in ' + (Date.now() - counter) + ' ms')
							// 		console.log(result)
							// 	})
	// 					})
	// 					.catch(function(err) {console.log('treePolicy error'); console.log(err)})
	//  			})
	//  			.catch(function(err2) {
	//  				console.log('createChildren.catch()')
	//  				console.log(err2)
	//  			})
	//  	}) // just in here for testing
	//  	.catch(function(err) { 
	// 		console.log('createNewRoot.catch()')
	//  		console.log(err) 
	//  	});
	

	  	
}