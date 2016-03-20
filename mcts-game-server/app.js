// ECMAScript 6
'use strict';
{
	let express = require('express')
		, _ = require('lodash')
		, bodyParser = require('body-parser')

	var app = express();
	app.use(bodyParser.json());

	
		// web client endpoint - will run MCTS one time from a given board state 
		//  and return a resulting action. the choice of actions will need to be then played out 
		//  and a resulting board state returned to the client.
	
	app.use('/play', require('./routes/play.route.js'));

	  // web client endpoint for AI vs AI games - so it can run MCTS until the game is done and 
	  //  return some signal that the game is done to the client. this should be able to run n 
	  //  games as an argument

		// MCTS module - setup for a single UCT search algorithm that calls these other modules. 
		//  the result will be an action to take, which then needs to be 'actually played' in the game.

		// neo4j module - setup for an HTTP-based call to our neo4j database with a query module

		// CLIPS module - setup for an HTTP-based call to our CLIPS server

		// serializer module - setup for a board serializer to generate or parse board strings to/from boards

		// game module - takes an action and applies it to a board, and returns a board.

		// configuration - an abstraction to pass config to different modules, such as base urls, endpoints

	console.log('localhost:3000')
	app.listen(3000)
}

