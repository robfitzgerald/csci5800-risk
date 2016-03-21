'use strict';
{
	var _ = require('lodash');
	
	var boards = require('../lib/boards')
		, game = require('../lib/game');

	module.exports = function(req, res, next) {
		var variantName = _.get(req.params, 'variant')
			, hasVariant = boards.hasVariant(variantName);
		if (!hasVariant) {
			res.status(400);
			next('[game.middleware] Error: ' + variant + ' is not a valid game variant');
		} else {
			var board, action;
			try {
				board = res.locals.board;
				action = res.locals.action;
			} catch (e) {
				// those things should be there. 400? 500?
				res.status(500);
				next(e);
			}
			// game is where we run the action on the board using the game
			// variant's 'play' member function.
			// 
			// @TODO: make it so!
			var variant = boards[variantName];
			res.locals.result = game(board, action, variant);
			next();
		}
	}
}