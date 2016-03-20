'use strict';
{
	let express = require('express')
		, route = express.Router();

	let mcts = require('./mcts.middleware')
	, game = require('./game.middleware')
	, helper = require('./helper.middleware')

	route.post('/:variant/ai', mcts, game, helper.gameResponse)
	route.post('/:variant/human', helper.skipMCTS, game, helper.gameResponse)

	module.exports = route;
}