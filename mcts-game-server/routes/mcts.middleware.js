'use strict';
{
	var _ = require('lodash')
		, config = require('config')
		, async = require('async')

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
	 		res.status(400);
	 		next('[mcts.middleware] Error: ' + variantName + ' is not a valid game variant');
	 	} else {
	 		var variant, board, stopTime, mctsIterations;
	 		try {
				variant = boards[variantName];
				board = req.body;
			} catch (e) {
				// something missing, or, server error.
				// maybe parse e to choose between 400 & 500?
				res.status(400);
				next(e);
			}

	 		try {
				variant = boards[variantName];
				var players = [];
				var generalized = variant.generalize(board);

				mcts.loop(generalized,variant,computationalBudget)
					.then(function(result) {
						var output = {
							board: board,
							move: result.move
						}
						res.locals = output;
						next();
					})
					.catch(function(error) {
						next(error);
					})
				
			} catch (e) {
				next(e);
			}	
		}
	}
}