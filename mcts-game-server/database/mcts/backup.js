'use strict';
{
	let Q = require('Q')
		, _ = require('lodash')
		, debug = require('debug')('mcts:database:mcts:backup')
		, helper = require('../database.helper')
	/**
	 * backup operation for Monte Carlo Tree Search
	 * @param  {Object} child        - child generalized board state we will backup from
	 * @param  {Number} rootBoard    - root board, from variant.rootNodeData()
	 * @param  {1|0} reward          - delta reward calculated by simulation.defaultPolicy()
	 * @return {Promise}             - string 'success' or error object if failed
	 */		
	module.exports = function (neo4j) {
		return function backup(child, rootBoard, reward) {
			var deferred = Q.defer();
			if ((typeof (Number.parseInt(reward))) !== 'number') {
				deferred.reject(new Error('[knowledgeBase.backup]: reward ' + JSON.stringify(reward) + ' is not a number'));
			} else if (typeof child !== 'object') {
				deferred.reject(new Error('[knowledgeBase.backup]: child state: "' + (typeof child) + '" should be an object.'));
			} else if (typeof rootBoard !== 'object') {
				deferred.reject(new Error('[knowledgeBase.backup]: root state: "' + (typeof rootBoard) + '" should be an object.'));
			} else {
				var hashChildBoard = helper.hash(helper.serialize(child)) ,
					hashRootBoard = helper.hash(helper.serialize(rootBoard)),
					query = `
							MATCH(child : BOARD{index: ${hashChildBoard}}), (root : BOARD {index: ${hashRootBoard}}),
							path = (child) - [:PARENT *] - > (root)
							WITH nodes(path) AS pathNodes UNWIND pathNodes as node
							WITH DISTINCT node
							SET node.visits = node.visits + 1, node.rewards = node.rewards + ${reward}`,
					payload = helper.constructQueryBody(query);
				debug('backing up from index ' + hashChildBoard + ' to root index ' + hashRootBoard + ' and applying reward value of ' + reward + '.')
				neo4j({json: payload}, function(err, response, body) {
					var neo4jError = _.get(body, 'errors')
						,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('backup', body) : null);
					if (errors) {
						deferred.reject(JSON.stringify(errors));
					} else {
						deferred.resolve('success');
					}
				});
			}
			return deferred.promise;
		}
	}
}