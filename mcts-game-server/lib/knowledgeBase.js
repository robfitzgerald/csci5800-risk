// an abstraction of neo4j calls
// a wrapper for cypher queries and the request module
'use strict';
{
	module.exports = {
		createNewRoot,
		createChildren
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
			var params = {
					boardParams: {
						nonTerminal: true,
						state: boardString,
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
							CREATE (n:UNEXPLORED {state: '${boardString}'})
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
	 * @param  {String} parent                  - parent board
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
								CREATE (n:UNEXPLORED {state: '${child}'})
					 		  CREATE (c) -[:POSSIBLE {name: move.name, params: move.params}]-> (n))
				 		  WITH c
							MATCH (p:BOARD {state: '${parent}'})
							WITH c, p
							CREATE (p) -[cr:CHILD {move}]-> (c)
							CREATE (c) -[pr:PARENT {move}]-> (p)
							RETURN p, c, cr, pr`
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
			console.log(JSON.stringify(payload))
			neo4j({json:payload}, function(err, response, body) {
				var neo4jError = _.get(body, 'errors')
					, errors = err || ((neo4jError.length > 0) ? neo4jError : null);
				if (errors) {
					deferred.reject(errors);
				} else {
					var result = _.get(body, 'results')  // parses neo4j response structure
					deferred.resolve(result)
				}
			})
			return deferred.promise;
		}
	}


	/**
	 * backup operation for Monte Carlo Tree Search
	 * @param  {String} child        - child board state we will backup from
	 * @param  {String} root         - root board state (empty starting point)
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
			var query = `
						MATCH (child:BOARD{state: '${child}'}),(root:BOARD {state: '${root}'}),
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
	 * finds the bestChild of a parent board and returns it along with the move that creates the child
	 * @param  {Object} parent - parent board state
	 * @return {Promise}  - Promise that resolves to a tuple of board state object, move object
	 */
	function bestChildCpZero(parent) {
		var deferred = Q.defer()
			, queries = [];
			queries.push(`
					MATCH (p:BOARD {state:'${parent}'}) -[r:CHILD]-> (c:BOARD)
					WITH c, r
					SET c.uct = toFloat(reduce(Q = 0, reward IN c.rewards | Q + reward)) / c.visits
					WITH c, r
					WHERE c.uct = 0
					SET c.uct = ${infinity}`);
			queries.push(`
					MATCH (p:BOARD {state:'${parent}'}) -[r:CHILD]-> (c:BOARD)
					RETURN c, r ORDER BY c.uct DESC LIMIT 1`)
		var payload = helper.constructQueryBody(queries, [null,null])
		neo4j({json:payload}, function(err, response, body) {
			var neo4jError = _.get(body, 'errors')
				, errors = err || ((neo4jError.length > 0) ? neo4jError : null);
			if (errors) {
				deferred.reject(errors);
			} else {
				var result = {};
				result.move = _.get(body, 'results[1].data[0].row[1]')  // parses neo4j response structure
				result.bestChild = _.get(body, 'results[1].data[0].row[0]')
				deferred.resolve(result)
			}
		})
		return deferred.promise;
	}


	function treePolicy(root) {
		var deferred = Q.defer()
			, v = root;
		do {
			var query = `
				MATCH (b:BOARD {state:'${v}'}) -[r:POSSIBLE]-> ()
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
					deferred.reject(errors);
				} else {
					// grab first move. order guaranteed? not guaranteed? probs not.
					var move = _.get(body, 'results[0].data[0].row[0]')
					console.log(JSON.stringify(move))
					if (move) {
						CLIPS.expand(v, move)
							.then(function(children) {
								// console.log('[treePolicy] CLIPS.expand() result: ')
								// console.log(children)
								createChildren(v, move, children)
									.then(function(result) {
										// console.log('[treePolicy] create new child result:')
										// console.log(result)
										deferred.resolve(result)
									})
									.catch(function(createError) {
										// console.log('[treePolicy] error from createChild() call:' + createError)
										deferred.reject(createError)
									})
							})
					} else {
						console.log('bestChild()')
						deferred.resolve('gets best child and repeats loop')
					}
				}
			})
			// if result has move, then expand(parent, move) call to CLIPS
			// return child
			// else if result has board, then repeat with v = that board
		} while (false/*v.nonTerminal*/)
  	return deferred.promise;
	}


	function debugGenerateTestChildren(number, parent) {
		for (var i = 0; i < number; ++i) {
			debugGenerateChild(i, parent);
		}
	}

	function debugGenerateChild(i, parent) {
		var testChild = {
			nonTerminal: true,
			state: helper.serializeBoard('a' + i + i + i + i + i),
			possibleMoves: ['some', 'posible', 'moves'],
			rewards: [(i % 2)],
			visits: 1,
			usedInGame: [],	
		}
		for (var j = 0; j < i; ++j) {
			testChild.rewards.push((j % 2))
			testChild.visits++;
		}
		var allRewards = testChild.rewards.reduce(function(acc, val) { return acc + val })
			, Xbar = allRewards / testChild.visits;
		testChild.uct = Xbar;

		createChild(parent, {move: 'test'}, testChild)
			.then(function(res) {
				console.log(i + 'th child has state ' + testChild.state)
				console.log(JSON.stringify(res));
			});
	}


	// backup({state:'sloop'}, null, 1)
	// 	.then(function(res){ console.log(JSON.stringify(res)); })
	// 	.catch(function(err) { console.log(err) })
	// console.log(helper.deserializeBoard('puppies'))
	// console.log(helper.serializeBoard('sloop'))
	// bestChildCpZero(parentBoard)
	// 	.then(function(res) { console.log(res)})
	// debugGenerateTestChildren(2, '55555');
	

	createNewRoot('betsy', [{name:'moves', params: ["asdf","sdfg","dfgh","fghj"]}, {name:'flooves', params: []}, {name:'shuld be not takey', params: []}])
	 	.then(function(res) { 
	 		console.log('createNewRoot.then()')
	 		console.log(res)
	 		createChildren('betsy', {name:'moves', params: ["asdf","sdfg","dfgh","fghj"]}, 
	 			[
			 		{
			 			state: 'ronnie',
			 			moves: [{name:'asdf', params: ["asdf","sdfg","dfgh","fghj"]}],
			 			nonTerminal: true
			 		},{
			 			state: 'zuko',
			 			moves: [{name:'fghah', params: []}],
			 			nonTerminal: true
			 		}
		 		])
	 			.then(function(res2) {
	 				console.log('createChildren.then()')
	 				console.log(res2)
					treePolicy('betsy')
						.then(function(res) {console.log('treePolicy success'); console.log(JSON.stringify(res))})
						.catch(function(err) {console.log('treePolicy error'); console.log(err)})
	 			})
	 			.catch(function(err2) {
	 				console.log('createChildren.catch()')
	 				console.log(err2)
	 			})
	 	}) // just in here for testing
	 	.catch(function(err) { 
			console.log('createNewRoot.catch()')
	 		console.log(err) 
	 	});
	  	
}