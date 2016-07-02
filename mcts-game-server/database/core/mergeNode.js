'use strict';
{
	let Q = require('Q')
		, _ = require('lodash')
		, debug = require('debug')('mcts:database:core:mergeNode')
		, helper = require('../database.helper')
		
	/**
	 * gets or creates a board node object
	 * @param  {Object} board  - generalized board object
	 * @return {Promise}       - resolves to a treeNode object, or error
	 */
	module.exports = function(neo4j) {
		return function mergeNode(board) {
			var deferred = Q.defer() ,
				serializedBoard = helper.serialize(board) ,
				hashBoard = helper.hash(serializedBoard) ,
				query = [
						`
							MERGE(p : BOARD {index: ${hashBoard}})
							ON CREATE SET p.nonTerminal = true, p.rewards = 0, p.visits = 0, p.createdAt = timestamp(), p.board = '${serializedBoard}'
							RETURN p
						`,
						`
							MATCH(p : BOARD {index: ${hashBoard}}) - [a: POSSIBLE] - ()
							RETURN a
						`] ,

				payload = helper.constructQueryBody(query, [{},{}]);
			neo4j({json: payload},
				function(err, res, body) {
					var neo4jError = _.get(body, 'errors')
						,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('mergeNode', body) : null);
					if (errors) {
						console.log('errors');
						deferred.reject(errors);
					} else {
						var resultBoard = _.get(body, 'results[0].data[0].row[0]');
						debug('result: ' + resultBoard)
						// TODO: implement branch that handles the case that we are at some board state which does not yet exist in the knowledge base
							// , actionData = _.get(body, 'results[1].data')
							// , actions = []
						// console.log('returned from neo4j with results, board, actiondata')
						// console.log(actionData)
						// _.forEach(actionData, function(d) {
						// 	console.log('d')
						// 	console.log(d)
						// 	var	thisAction = _.get(d, 'row[0]')
						// 	if (thisAction) {
						// 		actions.push(thisAction)
						// 	}
						// })
						// var needToExpand = (actions.length > 0 ? false : true);
						// if (needToExpand) {
							// @todo: if actions.length > 0, expand().then(function(){ createChildren().then(function() { deferred.resolve() }) })
							// this is how we deal with the situation where a new node is created. it will not yet have
							// any possibleMoves.  we need to expand it and then create it's children then finally return
							// the board.
						// }
						deferred.resolve(resultBoard);  // @todo: all entities in boards[] should be identical. check by _.uniq()?
					}
				});
			return deferred.promise;
		}
	}
}