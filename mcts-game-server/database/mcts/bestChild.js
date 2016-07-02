'use strict';
{
	let Q = require('Q')
		, _ = require('lodash')
		, debug = require('debug')('mcts:database:mcts:bestChild')
		, config = require('config')
		, infinity = config.get('mcts.infinity')
	/**
	 * bestChild operation in Monte Carlo Tree Search, using UCT method. finds the bestChild of a parent board and returns it along with the move that creates the child
	 * @param  {Object} parent - TreeNode of parent
	 * @param  {Integer}    Cp - the coefficient used in UCT for the second term. See essay on MCTS methods.
	 * @return {Promise}       - Promise that resolves to a tuple of board state object, move object; or, an error
	 */
	module.exports = function (neo4j) {
		return 	function bestChild(parent, Cp) {
			debug('bestChild called with coefficient value ' + Cp)
			var deferred = Q.defer() ,
				index = parent.index;
			if (!index) {
				throw new Error('[knowledgeBase.bestChild()]: no index on incoming parent object: \n' + JSON.stringify(parent));
			}
			var query = `
						MATCH(p:BOARD {index: ${index}}) - [r:CHILD] - > (c:BOARD)
						WITH collect(c) AS children, r AS moves, p AS parent
						RETURN EXTRACT(child in children |
								CASE
								WHEN child.visits = 0
								THEN {board: child.board, nonTerminal: child.nonTerminal, index: child.index, uct: ${infinity}}
								ELSE {
						      board: child.board,
						      nonTerminal: child.nonTerminal,
						      index: child.index,
						      uct:
						      	((toFloat
						      			(child.rewards) / child.visits) +
						       		${Cp}
						       			* SQRT(
						        			(2.0 * LOG(parent.visits)) /
						        		child.visits)
						       		)
						    }
					  	END)
				  	AS uct, moves`
						// TODO: within query, "ORDER BY uct DESC LIMIT 1"
			var payload = helper.constructQueryBody(query);
			neo4j({json: payload}, function(err, response, body) {
				var neo4jError = _.get(body, 'errors')
						,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('bestChild', body) : null);
				if (errors) {
					deferred.reject(body);
				} else {
					debug('neo4j call response body')
					debug(body)
					var result = [] ,
						childCount = _.get(body, 'results[0].data.length');
					for (var i = 0; i < childCount; ++i) {
						var child = {};
						// TODO: create helper to parse neo4j response object (or find one)
						child.board = _.get(body, 'results[0].data[' + i + '].row[0][0]');
						child.move = _.get(body, 'results[0].data[' + i + '].row[1]');
						result.push(child);
					}

					try {
						result.sort(function(a, b) {
							return b.board.uct - a.board.uct;
						});
					} catch(e) {
						let errorMessage = '[knowledgeBase.bestChild()]: neo4j returned without an array of children. there should always be at least one.'
						deferred.reject({
							errorMessage: errorMessage,
							errorDetails: e,
							neo4jResult: result
						})
					}

					var bestChild = _.head(result);
					debug('best child:')
					debug(bestChild)
					if (!bestChild) {
						throw new Error('[knowledgeBase.bestChild()]: neo4j returned result but it did not contain the expected structure: \n' + JSON.stringify(body) + '\n');
					}
					deferred.resolve(bestChild);
				}
			});
			return deferred.promise;
		}
	}
}