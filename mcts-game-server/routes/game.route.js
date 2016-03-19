'use strict';
{
	let express = require('express')
		, route = express.Router();

	let mcts = require('../lib/mcts')
	, game = require('../lib/game')
	, helper = require('../lib/helper')

	route.post('/:variant/play/ai', mcts, game, helper.gameResponse)
	route.post('/:variant/play/human', helper.skipMCTS, game, helper.gameResponse)

	module.exports = route;
}