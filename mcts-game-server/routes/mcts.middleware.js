'use strict';
{
	var _ = require('lodash')
		, config = require('config')

	var boards = require('../lib/boards')
		, mcts = require('../lib/mcts')
	
	var computationalBudget = config.get('mcts.computationalBudget');

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
	 		res.locals.error = '[mcts] Error: ' + variantName + ' is not a valid game variant';
	 		res.status(400);
	 		next();
	 	} else {
	 		var variant, board, action, stopTime, mctsIterations;
	 		try {
				variant = boards[variantName];
				board = req.body;
				action = req.body.action;
				stopTime = Date.now() + computationalBudget;
				mctsIterations = 0;
				delete board.action;
			} catch (e) {
				res.locals.error = e;
				// maybe parse e to choose between 400 & 500
				res.status(400);
				next();
			}
			while (Date.now() < stopTime) {

				// MCTS here.
				// member functions on variant exist to perform operations on a board
				// such as variant.countries, variant.current, or whatever
				// and the various steps in mcts are included as modules:
				// treePolicy, defaultPolicy, backup, bestChild
				// 
				// @TODO: make it so!

				mcts(board, action, variant)

				++mctsIterations;
			}
			
			console.log('[mcts] ran ' + mctsIterations + ' times.')

			// in the end, we want to pass the board along with the action to try.
			// we can't modify req.body, so, we set the board and the chosen
			// action on res.locals for game.js to find.
			// the next middleware function is the game function.
			res.locals.board = req.body;
			res.locals.action = 'our chosen action'
			
			// done.
		next();
		}
	}
}