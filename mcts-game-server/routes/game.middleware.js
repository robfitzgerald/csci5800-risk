'use strict';
{
	var _ = require('lodash');
	
	var boards = require('../lib/boards');

	module.exports = function(req, res, next) {
		var variantName = _.get(req.params, 'variant')
			, hasVariant = boards.hasVariant(variantName);
		if (!hasVariant) {
			res.locals.error('[game] Error: ' + variant + ' is not a valid game variant');
			res.status(400);
			next();
		} else {
			// game is where we run the action on the board using the game
			// variant's 'play' member function.
			// 
			// @TODO: make it so!
			var variant = boards[variantName];
			res.locals.result = variant.play(res.locals.board, res.locals.action);
			next();
		}
	}
}