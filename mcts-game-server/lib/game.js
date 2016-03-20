'use strict';
{
	/**
	 * performs an action on a board
	 * @param  {Object} board   game board object
	 * @param  {String} action  chosen action
	 * @param  {Object} variant gameVariant with variant.play(board, action) method
	 * @return {Object}         new game board object
	 */
	module.exports = function (board, action, variant) {
		return variant.play(board, action);
	}
}