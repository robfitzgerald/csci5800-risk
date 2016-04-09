'use strict';
{
	var treePolicy = require('./knowledgeBase').treePolicy
		, defaultPolicy = require('./clipsController').defaultPolicy
		, backup = require('./knowledgeBase').backup
		, Q = require('q')

	/**
	 * Monte Carlo Tree Search
	 * @param  {Object} board              - game board JSON object
	 * @param  {String}	board.gameVariant  - game variant name
	 * @param  {Object} variant            - singleton object with game-specific function implementation
	 * @return {[type]}             [description]
	 */
	module.exports = function mcts (board, variant) {
		var deferred = Q.defer();
		// perform mcts loop
		// this is a mock up from the Browne et.al. paper
		console.log('[mcts]: starting with board: ')
		console.log(board)
		let rootString = variant.generalize(variant.generate(board.gameVariant, board.playerDetails))
		console.log('rootString generated from provided board')
		console.log(rootString)
		treePolicy()
			.then(function(res) {
				console.log('[mcts>treePolicy]: success')
				deferred.resolve(res)

			})
			.catch(function(err) {
				console.log('[mcts>treePolicy]: failure')
				deferred.reject(err)
			})
		// var delta = defaultPolicy(vt);
		// backup(vt, delta)
		return deferred.promise;
	}
}