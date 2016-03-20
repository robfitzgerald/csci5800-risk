'use strict';
{
	let express = require('express')
		, route = express.Router();

	let mcts = require('./mcts.middleware')
	, game = require('./game.middleware')
	, helper = require('../lib/helper')

	route.post('/:variant/play/ai', mcts, game, helper.gameResponse)
	route.post('/:variant/play/human', helper.skipMCTS, game, helper.gameResponse)

	module.exports = route;
}