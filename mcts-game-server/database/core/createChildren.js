'use strict';
{
	let Q = require('Q')
		, _ = require('lodash')
		, debug = require('debug')('mcts:database:core:createChildren')
		, helper = require('../database.helper')
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
	module.exports = function (neo4j) {
		return function createChildren(parent, move, children) {
			// TODO: input validation
			let deferred = Q.defer()
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
				debug('entering function with valid arguments')
				let	statements = [] ,
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
				neo4j({json: payload}, function(err, response, body) {
					var neo4jError = _.get(body, 'errors') 
						,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('createChildren', body) : null);
					if (errors) {
						deferred.reject(errors);
					} else {
						debug('createChildren neo4j success response body:')
						debug(body)
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
	}
}