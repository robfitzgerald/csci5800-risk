'use strict';
{
	var treePolicy = require('./knowledgeBase').treePolicy
		, defaultPolicy = require('./clipsController').defaultPolicy
		, backup = require('./knowledgeBase').backup
		, Q = require('q')

	/**
	 * Monte Carlo Tree Search, as described in the Browne et.al. paper
	 * @param  {Object} board              - variant.generalized game board JSON object
	 * @param  {Object} variant            - ?singleton object with game-specific function implementation
	 * @return {Promise}             			 - a best child, or, error
	 */
	module.exports = function mcts (rootNode, variant) {
		var deferred = Q.defer();
		// @todo: wrap this in a async.whilst() loop
		console.log('[mcts]: starting with board: ')
		console.log(rootNode)
		treePolicy(rootNode)
			.then(function(res) {
				console.log('[mcts.treePolicy]: success')
				console.log(res)
				console.log('run defaultPolicy (not implemented)')
				deferred.resolve(res)

			})
			.catch(function(err) {
				console.log('[mcts.treePolicy]: failure')
				deferred.reject(err)
			})
		// var delta = defaultPolicy(vt);
		// backup(vt, delta)
		return deferred.promise;
	}
}