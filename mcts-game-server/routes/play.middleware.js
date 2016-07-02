'use strict';
{
	var _ = require('lodash')
		, debug = require('debug')('mcts:routes:play')
		, boards = require('../lib/boards')

	module.exports = function(req, res, next) {
		var variantName = _.get(req.params, 'variant')
			, hasVariant = boards.hasVariant(variantName);
		if (!hasVariant) {
			res.status(400);
			next('[game.middleware] Error: ' + variant + ' is not a valid game variant');
		} else {
			let variant = boards[variantName]
				, board = _.get(res.locals, 'board')
				,	action = _.get(res.locals, 'action')
			if (!board || !action) {
				debug('whoa. missing action or board. how can i play an action on the board? board, action:')
				debug(board)
				debug(action)
				next('[game.middleware]: i cannot apply a move without a board and an action in the local variables.');
			} else {
				res.locals.result = variant.play(board, action);
				debug('applied an action to the board. resulting board set to the local result variable. calling next() express middleware.')
				next();
			}
		}
	}
}