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

	/**
	 * creates a root node in the knowledge base
	 * @param  {Board} b        - game board object
	 * @param  {Object[]} moves - list of valid moves
	 * @param  {Object} variant - game variant object used to serialize/deserialize board states
	 * @return {Promise}        - Promise that returns created node on success
	 */
	function createNewRoot(b, moves, variant) {
		var board = '--BOARDTEST--p1:human,;p2:ai,'//variant.serialize(b)  // if b is JSON
			, index = hashBoard(board)
			, params = {
				boardParams: {
					nonTerminal: 'true',
					state: index,
					possibleMoves: moves,
					rewards: [],
					visits: 0,
					usedInGame: []
				}
			}
			, statement = 'CREATE (p:BOARD {boardParams}) RETURN p'
			, payload = constructQueryBody([statement], [params])

			neo4j({json:payload}, function(err, res, body) {
				console.log(body)
				isNonTerminal(board) // just in here for testing
				isFullyExpanded(board)  // testing for here, in just
				// TODO: deferred.resolve() / deferred.reject() of promise
			});
	}


	function createChild(p, move, c) {

	}

	/**
	 * checks if a given board is a non-terminal node
	 * @param  {Board}  b  - board state
	 * @return {Promise}   - promise that resolves to a boolean or error
	 */
	function isNonTerminal(b) {
		var deferred = Q.defer()
			, index = hashBoard(b)
			, query = `MATCH (b:BOARD{state:'${index}'}) RETURN b.nonTerminal AS isNonTerminal`
			, payload = constructQueryBody(query);
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
			, index = hashBoard(b)
			, query = `MATCH (b:BOARD{state:'${index}'}) RETURN size(b.possibleMoves) = 0 AS isFullyExpanded`
			, payload = constructQueryBody(query)
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

	function hashBoard(board) {
		var output = new Buffer(board)
		return output.toString('base64');
	}

	function constructQueryBody(statements, parameters) {
		if (!Array.isArray(statements) || !Array.isArray(parameters || statements.length != parameters.length)) {
			if (statements) {
				return {statements:[{statement:statements}]};
			} else {
				return {statements: []};
			}
		} else {
			var output = {statements:[]}
			for (var i = 0; i < statements.length; ++i) {
				output.statements.push({statement: statements[i], parameters: parameters[i]});
			}
			return output;
		}
	}

	//createNewRoot(null, ['move1', 'move2'], null);
	var board = '--BOARDTEST--p1:human,;p2:ai,'//variant.serialize(b)  // if b is JSON
	isNonTerminal(board)
		.then(function(res) { console.log(res) }) // just in here for testing
	isFullyExpanded(board)
		.then(function(res) { console.log(res) }) // just in here for testing

}