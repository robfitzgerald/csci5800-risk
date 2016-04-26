	'use strict';
{
	var _ = require('lodash')
		, async = require('async')
		, config = require('config')

	var mcts = require('../lib/mcts')
		, boards = require('../lib/boards')

	// this is a placeholder for some middleware solution that will play n games of some form
	// probably should wait to implement until we are more certain about this server framework
	module.exports = function (req, res, next) {
		var computationalBudget = Number.parseInt(_.get(req.params, 'computationalBudget') || config.get('mcts.computationalBudget'))
			, numberOfGames = Number.parseInt(_.get(req.params, 'numberOfGames'))
			, numberOfPlayers = Number.parseInt(_.get(req.params, 'numberOfPlayers'))
	 		, variantName = _.get(req.params, 'variant')
	 		, hasVariant = boards.hasVariant(variantName);
	 	if (!hasVariant) {
	 		next('[training.middleware] Error: ' + variantName + ' is not a valid game variant');
	 	} else if (!numberOfGames || (Number.isNaN(numberOfGames)) || (numberOfGames < 0)) {
	 		next('[training.middleware] Error: ' + numberOfGames + ' is not a valid number of games');
		} else if (!numberOfPlayers || (Number.isNaN(numberOfPlayers)) || (numberOfPlayers < 0) || (numberOfPlayers > boards[variantName].maxPlayers)) {
	 		next('[training.middleware] Error: ' + numberOfPlayers + ' is not a valid number of players');
		} else {
			console.log('[training.middleware] variant: ' + variantName + ', numberOfGames: ' + numberOfGames + ', numberOfPlayers: ' + numberOfPlayers + ', computationalBudget: ' + computationalBudget)
	 		var variant, board, players;
	 		
	 		try {
				variant = boards[variantName];
				var players = [];
				for (let i = 0; i < numberOfPlayers; ++i) {
					players.push({type:'AI',subVariant:'AIvsAI'})
				}
				board = variant.generate(variantName,players);
				var generalized = variant.generalize(board);
			} catch (e) {
				next(e);
			}	

			async.doWhilst(function(callback) {
				mcts.loop(generalized,variant,computationalBudget)
					.then(function(bestChild) {
						board = variant.play(board,bestChild.move);
						generalized = variant.generalize(board);
						console.log('[training.middleware]: player ' + board.Turn + ' chose action ' + JSON.stringify(bestChild.move))
						callback();
					})
					.catch(function(mctsLoopError) {
						callback(mctsLoopError)
					})
			},
			function() { return !board.gameOver(); },
			function(error, result) {
				if (error) {
					next(error);
				} else {
					res.locals = board;
					next();
				}
			})	
		}
	}
}