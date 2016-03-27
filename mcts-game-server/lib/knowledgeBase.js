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
				// TODO: deferred.resolve() / deferred.reject() of promise
			});
	}


	function createChild(p, move, c) {

	}

	/**
	 * checks if a given board is a non-terminal node
	 * @param  {Board}  b  - board state
	 * @return {Promise}   - promise that resolves to a boolean
	 */
	function isNonTerminal(b) {
		var index = hashBoard(b)
			, query = `MATCH (b:BOARD{state:'${index}'}) RETURN b.nonTerminal`
			, payload = constructQueryBody(query);
		neo4j({json:payload}, function(err, response, body) {
			console.log('isNonTerminal() result:')
			console.log(JSON.stringify(body))
			console.log('resolve promise w/ boolean')
		})
	}

	/**
	 * checks if a given board is fully expanded
	 * @param  {Board}  b  - board state
	 * @return {Promise}   - promise that resolves to a boolean
	 */
	function isFullyExpanded(b) {
		var index = hashBoard(b)
			, query = `MATCH (b:BOARD{state:${index}}) RETURN b.possibleMoves.length`
			, payload = constructQueryBody(query)
		neo4j({json:payload}, function(err, response, body) {
			console.log('resolve promise')
			// TODO: find out how to check length of array
		})
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

	createNewRoot(null, ['move1', 'move2'], null);
}