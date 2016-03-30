// an abstraction of neo4j calls
// a wrapper for cypher queries and the request module
'use strict';
{
	module.exports = {
		createNewRoot,
		createChild
	}

	var config = require('config')
		, auth = new Buffer(config.get('neo4j.username') + ':' + config.get('neo4j.password'))
		, request = require('request')
		, _ = require('lodash')
		, Q = require('q')
		, async = require('async')
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
	 * @param  {Board} b        - game board object
	 * @param  {Object[]} moves - array of valid moves from state
	 * @param  {String} variant - game variant name - becomes root state name
	 * @return {Promise}        - Promise that returns created node on success
	 */
	function createNewRoot(moves, variant) {
		var deferred = Q.defer()
	  if (!typeof variant === 'string') {
	  	deferred.reject('[knowledgeBase.createNewRoot]: arg 2 ("variant") should be a string, got ' + JSON.stringify(variant));
	  	return deferred.promise;
	  }
	  if (!Array.isArray(moves)) {
	  	deferred.reject('[knowledgeBase.createNewRoot]: arg 1 ("moves") should be an array')
	  	return deferred.promise;
	  }
		var index = helper.serializeBoard(variant)
			, params = {
				boardParams: {
					nonTerminal: true,
					state: index,
					possibleMoves: moves,
					rewards: [],
					visits: 0,
					usedInGame: []
				}
			}
			, statement = 'CREATE (p:BOARD {boardParams}) RETURN p'
			, payload = helper.constructQueryBody(statement, params)
		neo4j({json:payload}, function(err, res, body) {
			if (err) {
				deferred.reject(err);
			} else {
				var result = _.get(body, 'results[0].data[0].row[0]')  // parses neo4j response structure
				deferred.resolve(result)
			}
		});
		return deferred.promise;
	}


	function createChild(parent, move, child) {
		// TODO: we need to know if this node is terminal
		// TODO: input validation
		if (!typeof child === 'object' || !typeof parent === 'object') {
			deferred.reject('[knowledgeBase.createChild] error: createChild arg1 and arg3 should be objects');
			return deferred.promise;
		}
		// TODO: serialize should be a function that takes a board state object and stringifies it
		child.state = helper.serializeBoard(child.state)
		var deferred = Q.defer()
			, parentIndex = helper.serializeBoard(parent.state)
			, params = {
				child: c,
				move: move,
			}
			, query = `
					CREATE (c:BOARD {child})
					WITH c
					MATCH (p:BOARD {state: '${parentIndex}'})
					WITH c, p
					CREATE (p) -[cr:CHILD {move}]-> (c)
					CREATE (c) -[pr:PARENT {move}]-> (p)
					RETURN p, c, cr, pr`
			, payload = helper.constructQueryBody(query, params)
		neo4j({json:payload}, function(err, response, body) {
			if (err) {
				deferred.reject(err);
			} else {
				var result = _.get(body, 'results[0].data[0].row[0]')  // parses neo4j response structure
				deferred.resolve(result)
			}
		})
		return deferred.promise;
	}

	/**
	 * checks if a given board is a non-terminal node
	 * @param  {Board}  b  - board state
	 * @return {Promise}   - promise that resolves to a boolean or error
	 */
	function isNonTerminal(b) {
		var deferred = Q.defer()
			, index = helper.serializeBoard(b)
			, query = `MATCH (b:BOARD{state:'${index}'}) RETURN b.nonTerminal AS isNonTerminal`
			, payload = helper.constructQueryBody(query);
		neo4j({json:payload}, function(err, response, body) {
			if (err) {
				deferred.reject(err);
			} else {
				var result = _.get(body, 'results[0].data[0].row[0]')  // parses neo4j response structure
				deferred.resolve(result)
			}
		})
		return deferred.promise;
	}

	/**
	 * checks if a given board is fully expanded
	 * @param  {Board}  b  - board state
	 * @return {Promise}   - promise that resolves to a number or error
	 */
	function isFullyExpanded(b) {
		var deferred = Q.defer()
			, index = helper.serializeBoard(b)
			, query = `MATCH (b:BOARD{state:'${index}'}) RETURN size(b.possibleMoves) = 0 AS isFullyExpanded`
			, payload = helper.constructQueryBody(query)
		neo4j({json:payload}, function(err, response, body) {
			if (err) {
				deferred.reject(err);
			} else {
				var result = _.get(body, 'results[0].data[0].row[0]')  // parses neo4j response structure
				deferred.resolve(result)
			}
		})
		return deferred.promise;
	}


	/**
	 * backup operation for Monte Carlo Tree Search
	 * @param  {Board} b        - board state
	 * @param  {Integer} reward - delta reward calculated by defaultPolicy
	 * @return {null | Object}  - null if success, error object if failed
	 */
	function backup(child, root, reward) {
		var deferred = Q.defer()
			, childStateString = _.get(child, 'state')
			, rootStateString = _.get(root, 'state')
		if (typeof reward !== 'number') {
			deferred.reject('[knowledgeBase.backup] error: reward ' + reward + ' is not a number');
			return deferred.promise;
		} else if (!childStateString || !rootStateString) {
			deferred.reject('[knowledgeBase.backup] error: child state string: "' + childStateString + '", root state string: "' + rootStateString + '". both should exist.')
			return deferred.promise;
		} else {
			var childIndex = helper.serializeBoard(childStateString)
				, rootIndex = helper.serializeBoard(rootStateString)
				, query = `
						MATCH (child:BOARD{state: '${childIndex}'}),(root:BOARD {state: '${rootIndex}'}),
						path = (child) -[:PARENT*]-> (root)
						WITH nodes(path) AS pathNodes UNWIND pathNodes as node
						WITH DISTINCT node
						SET node.visits = node.visits + 1, node.rewards = node.rewards + ${reward}
						RETURN collect(node)`
				, payload = helper.constructQueryBody(query)

			neo4j({json:payload}, function(err, response, body) {
				console.log(body)
				if (err) {
					deferred.reject(err);
				} else {
					var result = _.get(body, 'results[0].data[0].row[0]')  // parses neo4j response structure				
					deferred.resolve(result)
				}
			})
			return deferred.promise;
		}
	}

	/**
	 * finds the bestChild of a parent board and returns it along with the move that creates the child
	 * @param  {Object} b - parent board state
	 * @return {Promise}  - Promise that resolves to a tuple of board state object, move object
	 */
	function bestChild(b) {
		var deferred = Q.defer()
			, index = helper.serializeBoard(b)
			, queries = [];
			queries.push(`
					MATCH (p:BOARD {state:'${index}'}) -[r:CHILD]-> (c:BOARD)
					WITH c, r
					SET c.uct = toFloat(reduce(Q = 0, reward IN c.rewards | Q + reward)) / c.visits
					WITH c, r
					WHERE c.uct = 0
					SET c.uct = ${infinity}`);
			queries.push(`
					MATCH (p:BOARD {state:'${index}'}) -[r:CHILD]-> (c:BOARD)
					RETURN c, r ORDER BY c.uct DESC LIMIT 1`)
		var payload = helper.constructQueryBody(queries, [null,null])
		neo4j({json:payload}, function(err, response, body) {
			if (err) {
				deferred.reject(err);
			} else {
				var result = {};
				result.move = _.get(body, 'results[1].data[0].row[1]')  // parses neo4j response structure
				result.bestChild = _.get(body, 'results[1].data[0].row[0]')
				deferred.resolve(result)
			}
		})
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

	var	parentBoard = 'board';

	backup({state:'sloop'}, null, 1)
		.then(function(res){ console.log(JSON.stringify(res)); })
		.catch(function(err) { console.log(err) })
	// console.log(helper.deserializeBoard('sloop'))
	// console.log(helper.serializeBoard('sloop'))
	// bestChild(parentBoard)
	// 	.then(function(res) { console.log(res)})
	// debugGenerateTestChildren(2, '55555');
	// createChild('55555', {moveName: 'coolNameBro'}, testChild)
	//  	.then(function(res) { console.log(res)})
	//  	.catch(function(err) { console.log('error!'); console.log(err)})	
	// createNewRoot(null, ['pizza', 'party'], null)
	//  	.then(function(res) { console.log(res) }) // just in here for testing
	// var board = '--BOARDTEST--p1:human,;p2:ai,'//variant.serialize(b)  // if b is JSON
	// isNonTerminal(board)
	// 	.then(function(res) { console.log(res) }) // just in here for testing
	// isFullyExpanded(board)
	// 	.then(function(res) { console.log(res) }) // just in here for testing
	// 	
	// 	
}