'use strict';
{
	let express = require('express')
		, route = express.Router();

	let createRoot = require('./createRoot.middleware')
		, mcts = require('./mcts.middleware')
		, play = require('./play.middleware')
		, training = require('./training.middleware')
		, helper = require('./helper.middleware')
		, deleteAll = require('./deleteAll.middleware')
		, monitor = require('./processMonitor.middleware')

	let monitorUtility = require('../lib/trainingProcessMonitor');

	route
		.delete('/delete/everything/:imsure', deleteAll, helper.genericResponse)
		.post('/:variant/createroot', createRoot, helper.genericResponse)
		.post('/:variant/ai', mcts, play, helper.gameResponse)
		.post('/:variant/human', helper.skipMCTS, play, helper.gameResponse)
		.post('/:variant/training/games/:numberOfGames/players/:numberOfPlayers/budget/:computationalBudget', training(monitorUtility), helper.trainingResponse)
		.post('/:variant/training/games/:numberOfGames/players/:numberOfPlayers', training(monitorUtility), helper.trainingResponse)
		.get('/process/:process/verbose', monitor.getInfo(monitorUtility, true))
		.get('/process/verbose', monitor.getInfo(monitorUtility, true))
		.get('/process/:process', monitor.getInfo(monitorUtility))
		.get('/process', monitor.getInfo(monitorUtility))
		.delete('/process/:process', monitor.endProcess(monitorUtility))
		.delete('/process', monitor.endProcess(monitorUtility))
	
	module.exports = route;
}