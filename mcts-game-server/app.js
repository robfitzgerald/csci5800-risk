// ECMAScript 6
'use strict';
{
	let express = require('express')
		, _ = require('lodash')
		, bodyParser = require('body-parser')

	let helper = require('./routes/helper.middleware')

	var app = express();
	app.use(bodyParser.json());

		// web client endpoint - will run MCTS one time from a given board state 
		//  and return a resulting action. the choice of actions will need to be then played out 
		//  and a resulting board state returned to the client.
	
	app.use('/play', require('./routes/play.route.js'));

	  // web client endpoint for AI vs AI games - so it can run MCTS until the game is done and 
	  //  return some signal that the game is done to the client. this should be able to run n 
	  //  games as an argument

	app.use(helper.errorResponse);

	console.log('localhost:3000')
	app.listen(3000)
}

