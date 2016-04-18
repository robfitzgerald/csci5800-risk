'use strict';
{
	var treePolicy = require('./knowledgeBase').treePolicy
		, defaultPolicy = require('./clipsController').defaultPolicy
		, backup = require('./knowledgeBase').backup
		, Q = require('q')

	/**
	 * Monte Carlo Tree Search, as described in the Browne et.al. paper
	 * @param  {Object} board              - game board JSON object
	 * @param  {Object} variant            - singleton object with game-specific function implementation
	 * @return {Promise}             			 - a best child, or, error
	 */
	module.exports = function mcts (rootNode) {
		var deferred = Q.defer();
		// @todo: wrap this in a async.whilst() loop
		// this is a mock up 
		let v0 = variant.generalize(rootNode)
		console.log('[mcts]: starting with board: ')
		console.log(board)
		treePolicy(v0)
			.then(function(res) {
				console.log('[mcts.treePolicy]: success')
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