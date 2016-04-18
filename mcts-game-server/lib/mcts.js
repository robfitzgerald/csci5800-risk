'use strict';
{
	var treePolicy = require('./knowledgeBase').treePolicy
		, defaultPolicy = require('./clipsController').defaultPolicy
		, createRootNode = require('./knowledgeBase').mergeNode
		, backup = require('./knowledgeBase').backup
		, Q = require('q')

	/**
	 * Monte Carlo Tree Search, as described in the Browne et.al. paper
	 * @param  {Object} board              - variant.generalized game board JSON object
	 * @param  {Object} variant            - ?singleton object with game-specific function implementation
	 * @return {Promise}             			 - a best child, or, error
	 */
	module.exports = function mcts (root, variant) {
		var deferred = Q.defer();
		// @todo: wrap this in a async.whilst() loop
		console.log('[mcts]: starting with board: ')
		console.log(root)

		// @todo: create or merge this board state into database
		createRootNode(root)
			.then(function(v0) {
				console.log('v0 returned as: \n' + JSON.stringify(v0))
				treePolicy(v0)
					.then(function(res) {
						console.log('[mcts.treePolicy]: success')
						deferred.resolve(res)
					})
					.catch(function(err) {
						console.log('[mcts.treePolicy]: failure')
						deferred.reject(err)
					})
			})
			.catch(function(createRootNodeErr) {

			})
		// var delta = defaultPolicy(vt);
		// backup(vt, delta)
		// return action(bestChild(v0, 0);
		return deferred.promise;
	}
}