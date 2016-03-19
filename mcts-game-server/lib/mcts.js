'use strict';
{
	var _ = require('lodash');

	var boards = require('./boards')
		// , treePolicy = require('./treePolicy')
		// , defaultPolicy = require('./defaultPolicy')
		// , backup = require('./backup')
		// , bestChild = require('./bestChild');

	/**
	 * monte carlo tree search
	 * @param  {Request}  req                - express request object
	 * @param  {Board}    req.body           - board string
	 * @param  {String}   req.params.variant - game variant
	 * @param  {Response} res                - express response object
	 * @param  {Function} next               - callback on complete
	 * @return {Function}                    - Express middleware function
	 */
	 module.exports = function(req, res, next) {
	 	var variantName = _.get(req.params, 'variant')
	 	, hasVariant = boards.hasVariant(variantName);
	 	if (!hasVariant) {
	 		res.locals.error = '[MCTS] Error: ' + variantName + ' is not a valid game variant';
	 		res.status(400);
	 		next();
	 	} else {
			// MCTS where
			// member functions on variant exist to perform operations on a board
			// such as variant.countries, variant.current, or whatever
			// and the various steps in mcts are included as modules:
			// treePolicy, defaultPolicy, backup, bestChild
			// 
			// @TODO: make it so!

			// loop
			var i = 0;
			while (i < 1000) {
				// mcts here
				++i;
			}
			
			// in the end, we want to pass the board along with the action to try.
			// we can't modify req.body, so, we set the board and the chosen
			// action on res.locals for game.js to find.
			res.locals.board = req.body;
			res.locals.action = 'our chosen action'
			
			// done.
		next();
		}
	}
}