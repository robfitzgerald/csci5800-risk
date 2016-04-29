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
					.then(function(root) {
						res.locals.root = root;
						knowledgeBase.configureDatabase()
							.then(function(configured) {
								res.locals.configured = configured;  // nothing for now
								next();
							})
							.catch(function(err) {
								next(err);
							})
					})
					.catch(function(err) {
						next(err)
					})
			} catch (e) {
				next(e);
			}
		}
	}
}