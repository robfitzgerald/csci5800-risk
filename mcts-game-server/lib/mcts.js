'use strict';
{
	var treePolicy = require('./treePolicy')
		, defaultPolicy = require('./defaultPolicy')
		, backup = require('./backup')

	/**
	 * Monte Carlo Tree Search
	 * @param  {Object} state              - game state JSON object
	 * @param  {Object} gameVariant        - singleton object with game-specific function implementation
	 * @param  {Function} gameVariant.play - function that takes a board state and an action
	 * @return {[type]}             [description]
	 */
	module.exports = function(state, action, variant) {

		// perform mcts loop
		// this is a mock up from the Browne et.al. paper
		var v0, vt, delta, 
			s = function() {};
		vt = treePolicy(v0);
		var delta = defaultPolicy(s(vt));
		backup(vt, delta)
		// maybe return something like a flag or some shit		
	}
}