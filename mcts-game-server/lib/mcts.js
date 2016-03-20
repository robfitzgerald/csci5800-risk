'use strict';
{
	var treePolicy = require('./treePolicy')
		, defaultPolicy = require('./defaultPolicy')
		, backup = require('./backup')
		, bestChild = require('./bestChild')

	/**
	 * Monte Carlo Tree Search
	 * @param  {Object} state              - game state JSON object
	 * @param  {Object} gameVariant        - singleton object with game-specific function implementation
	 * @param  {Function} gameVariant.play - function that takes a board state and an action
	 * @return {[type]}             [description]
	 */
	module.exports = function(state, action, variant) {

		// perform mcts loop

		// maybe return something like a flag or some shit
	}
}