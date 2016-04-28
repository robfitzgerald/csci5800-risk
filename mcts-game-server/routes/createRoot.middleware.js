'use strict';
{
	var _ = require('lodash')
		, boards = require('../lib/boards')
		, knowledgeBase = require('../lib/knowledgeBase')

	module.exports = function(req, res, next) {
		var variantName = _.get(req.params, 'variant')
			, hasVariant = boards.hasVariant(variantName);
		if (!hasVariant) {
			res.status(400);
			next('[game.middleware] Error: ' + variant + ' is not a valid game variant');
		} else {
			try {
				var variant = boards[variantName]
					, rootNodeData = variant.rootNodeData();
				knowledgeBase.createNewRoot(rootNodeData.board, rootNodeData.moves)
					.then(function(result) {
						res.locals = 'success';
					})
					.catch(function(err) {
						throw new Error(err)
					})
			} catch (e) {
				next(e);
			}
			// game is where we run the action on the board using the game
			// variant's 'play' member function.
			// 
			// @TODO: make it so!
			var variant = boards[variantName];
			// res.locals.result = game(board, action, variant);
			next();
		}
	}
}