'use strict';
{
	let _ = require('lodash')
		, Q = require('Q')
		, debug = require('debug')('mcts:database:core:createNewRoot')
		, helper = require('../database.helper')
	/**
	 * creates a root node in the knowledge base
	 * @param  {Object[]} moves     - array of valid moves from state
	 * @param  {TreeNode} board     - game board object (should be generated via variant.generate())
	 * @return {Promise}            - Promise that returns the created root node on success
	 */
	module.exports = function(database) {
		return function createNewRoot(board, moves) {
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
			  	var possibleMoves = [];
			  	_.forEach(moves, function(move) {
			  		var moveData = {};
			  		moveData.move = move;
			  		moveData.unexploredIndex = helper.serializeAction(move);
			  		possibleMoves.push(moveData);
			  	});
			  	var serializedBoard = helper.serialize(board) ,
			  		hashBoard = helper.hash(serializedBoard) ,
						params = {
							boardParams: {
								nonTerminal: true,
								index: hashBoard,
								board: serializedBoard,
								rewards: 0,
								visits: 0,
								createdAt: Date.now()
							},
							possibleMoves: possibleMoves,

						}
						// @TODO: check if already exists, and just return it.
						, statement = `
								MERGE(p : BOARD {index: ${hashBoard}})
								ON CREATE SET p.nonTerminal = true, p.rewards = 0, p.visits = 0, p.createdAt = timestamp(), p.board = '${serializedBoard}'
								FOREACH(moveData in {possibleMoves} |
					 		  	MERGE(p) - [: POSSIBLE {name: moveData.move.name, params: moveData.move.params}] - > (n : UNEXPLORED {index: moveData.unexploredIndex}))
						 		RETURN p`
						,	payload = helper.constructQueryBody(statement, params);
					database({json: payload}, function(err, res, body) {
						var neo4jError = _.get(body, 'errors')
							,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('createNewRoot', body) : null);
						if (errors) {
							deferred.reject(errors);
						} else {
							debug('createNewRoot neo4j call response body: ' + JSON.stringify(body))
							let result = _.get(body, 'results[0].data[0].row[0]');  // parses neo4j response structure
							if (result && result.hasOwnProperty('board')) {
								debug('neo4j created a new root node')
								result.board = helper.deserialize(result.board)
							} else {
								debug('createNewRoot neo4j found a matching root board. no new node was created.')
								deferred.reject({
									error: 'neo4j result does not contain a board property:',
									result: result
								})
							}
							debug('createNewRoot resolving promise and passing new root node via promise.')
							deferred.resolve(result);
						}
					});
				}
				return deferred.promise;
			}			
	}
}