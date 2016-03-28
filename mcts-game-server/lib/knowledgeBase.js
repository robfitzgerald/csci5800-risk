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
		, neo4j = request.defaults({
			method: 'POST',
			url: config.get('neo4j.baseUrl'),
			headers: {
				Authorization: 'Basic ' + auth.toString('base64')
			}
		})
		, explorationParameter = config.get('mcts.explorationParameter')
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
			console.log(payload)
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
	function backup(b, reward) {
		var deferred = Q.defer()
		if (typeof reward !== 'number') {
			deferred.reject('[knowledgeBase.backup] error: reward ' + reward + ' is not a number');
		} else {
			var index = helper.serializeBoard(b)
				, query = `
						MATCH p =(begin)-[r:PARENT]->(END )
						WHERE begin.state={state:'${index}'}
						FOREACH (n IN nodes(p)| 
							SET 
								n.rewards = n.rewards + ${reward}, 
								n.visits = n.visits + 1, 
								n.uct = (reduce(Q = 0, reward IN n.rewards | Q + reward) / child.visits + (2 * ${explorationParameter} * ((2 * LOG(p.visits)) /  child.visits) ^ 0.5))`
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
			, query = `
					MATCH (p:BOARD {state:'${index}'}) -[r:CHILD]-> (c:BOARD)
					WITH c, r
					SET c.uct = reduce(Q = 0, reward IN c.rewards | Q + reward)
					WITH c, r
					SET c.uct = toFloat(c.uct) / c.visits
					WITH c, r
					WHERE c.uct = 0
					SET c.uct = 999
					RETURN c, r ORDER BY c.uct DESC LIMIT 1`
			, payload = helper.constructQueryBody(query)
		neo4j({json:payload}, function(err, response, body) {
			if (err) {
				deferred.reject(err);
			} else {
				var result = {};
				result.bestChild = _.get(body, 'results[0].data[0].row[0]')  // parses neo4j response structure
				result.move = _.get(body, 'results[0].data[0].row[1]')
				deferred.resolve(result)
			}
		})
		return deferred.promise;
	}

	var	parentBoard = 'board';

	//console.log(deserializeBoard('NTU1NTU='))
	bestChild(parentBoard)
		.then(function(res) { console.log(res)})
	// generateTestChildren(7, parentBoard);
	// createChild(parentBoard, {moveName: 'coolNameBro'}, testChild)
	// 	.then(function(res) { console.log(res)})
	// 	.catch(function(err) { console.log('error!'); console.log(err)})	
	// createNewRoot(null, ['pizza', 'party'], null)
	//  	.then(function(res) { console.log(res) }) // just in here for testing
	//var board = '--BOARDTEST--p1:human,;p2:ai,'//variant.serialize(b)  // if b is JSON
	// isNonTerminal(board)
	// 	.then(function(res) { console.log(res) }) // just in here for testing
	// isFullyExpanded(board)
	// 	.then(function(res) { console.log(res) }) // just in here for testing

}