// an abstraction of neo4j calls
// a wrapper for cypher queries and the request module
'use strict';
{
	module.exports = {
		createNewRoot
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

	function createNewRoot(b, moves, variant) {
		var board = '--BOARDTEST--p1:human,;p2:ai,'//variant.serialize(b)  // if b is JSON
			, index = hashBoard(board)
			, params = {
				boardParams: {
					expanded: 'true',
					state: board,
					expandableMoves: moves,
					rewards: [],
					visits: 0,
					usedInGame: []
				}
			}
			, query = 'CREATE (p:BOARD {boardParams}) RETURN p'
			console.log('query')
			console.log(query);

			neo4j(
				{json:
					{statements: [
						{
							statement: query,
							parameters: params
						}
					]
				}
			}, function(err, res, body) {
				console.log(body)
			});
	}

	function isNonTerminal(b) {

	}

	function hashBoard(board) {
		var output = new Buffer(board)
		return output.toString('base64');
	}
	
	//createNewRoot(null, ['move1', 'move2'], null);
	//isNonTerminal(b)
}