'use strict';
{
	var _ = require('lodash')
		, config = require('config')

	var mcts = require('../lib/mcts')
		, boards = require('../lib/boards')
		, bestChild = require('../lib/bestChild')
		, game = require('../lib/game')

	// this is a placeholder for some middleware solution that will play n games of some form
	// probably should wait to implement until we are more certain about this server framework
	module.exports = function (req, res, next) {
		var computationalBudget = _.get(req.params, 'computationalBudget') || config.get('mcts.computationalBudget')
			, numberOfGames = _.get(req.params, 'numberOfGames')
			, numberOfPlayers = _.get(req.params, 'numberOfPlayers')
	 		, variantName = _.get(req.params, 'variant')
	 		, hasVariant = boards.hasVariant(variantName);
	 	if (!hasVariant) {
	 		res.status(400);
	 		next('[training.middleware] Error: ' + variantName + ' is not a valid game variant');
	 	} else if (!numberOfGames || (Number.isNaN(parseInt(numberOfGames))) || (numberOfGames < 0)) {
	 		res.status(400);
	 		next('[training.middleware] Error: ' + numberOfGames + ' is not a valid number of games');
		} else if (!numberOfPlayers || (Number.isNaN(parseInt(numberOfPlayers))) || (numberOfPlayers < 0) || (numberOfPlayers > boards[variantName].maxPlayers)) {
	 		res.status(400);
	 		next('[training.middleware] Error: ' + numberOfPlayers + ' is not a valid number of players');
		} else {
			console.log('[training.middleware] variant: ' + variantName + ', numberOfGames: ' + numberOfGames + ', numberOfPlayers: ' + numberOfPlayers + ', computationalBudget: ' + computationalBudget)
			// some loop running numberOfGames games
			// see mcts.middleware.js for some direction on this
			next();
		}
	}
}