'use strict';
{
	let express = require('express')
		, route = express.Router();

	let mcts = require('./mcts.middleware')
	, play = require('./play.middleware')
	, training = require('./training.middleware')
	, helper = require('./helper.middleware')

	route
		.post('/:variant/ai', mcts, play, helper.gameResponse)
		.post('/:variant/human', helper.skipMCTS, play, helper.gameResponse)
		.post('/:variant/training/games/:numberOfGames/players/:numberOfPlayers/budget/:computationalBudget', training, helper.trainingResponse)
		.post('/:variant/training/games/:numberOfGames/players/:numberOfPlayers', training, helper.trainingResponse)

	module.exports = route;
}