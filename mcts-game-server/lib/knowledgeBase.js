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
	 * @param  {Object[]} moves - list of valid moves
	 * @param  {Object} variant - game variant object used to serialize/deserialize board states
	 * @return {Promise}        - Promise that returns created node on success
	 */
	function createNewRoot(b, moves, variant) {
		var deferred = Q.defer()
			, board = 'board'//variant.serialize(b)  // if b is JSON
			, index = helper.serializeBoard(board)
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
			, payload = helper.constructQueryBody([statement], [params])
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


	function createChild(p, move, c) {
		// TODO: we need to know if this node is terminal
		// TODO: input validation
		var deferred = Q.defer()
			, parentIndex = helper.serializeBoard(p)
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
				console.log('createChild result')
				console.log(body)
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
		if (typeof reward !== 'number' && !_.get(child, 'state') && !_.get(root, 'state')) {
			deferred.reject('[knowledgeBase.backup] error: reward ' + reward + ' is not a number');
		} else {
			var childIndex = helper.serializeBoard(child)
				, rootIndex = helper.serializeBoard(root)
				, query = `
						MATCH (child:BOARD{state: '${childIndex}'}),(root:BOARD {state: '${rootIndex}'}),
						path = allShortestPaths((child) -[PARENT*]-> (root))
						WITH path
						FOREACH (node IN nodes(path) |
							SET node.visits = node.visits + 1, node.rewards = node.rewards + ${reward})
						RETURN path`
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
	}

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

	function generateTestChildren(number, parent) {
		for (var i = 0; i < number; ++i) {
			generateChild(i, parent);
		}
	}

	function generateChild(i, parent) {
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

	// backup('a11111', parentBoard, 1)
	// 	.then(function(res){ console.log(JSON.stringify(res)); })
	// console.log(helper.deserializeBoard('YTExMTEx'))
	bestChild(parentBoard)
		.then(function(res) { console.log(res)})
	// generateTestChildren(2, '55555');
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