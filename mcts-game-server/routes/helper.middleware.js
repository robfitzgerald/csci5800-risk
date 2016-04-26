'use strict';
{
	var _ = require('lodash');

	module.exports = {
		skipMCTS,
		gameResponse,
		trainingResponse,
		errorResponse
	}

	function skipMCTS(req, res, next) {
		var action = _.get(req.body, 'action')
		if (!action) {
	 		res.status(400);
	 		next('[skipMCTS] Error: action missing from request body');			
		} else {
			var board = req.body;
			delete board.action;
			res.locals.action = action;
			res.locals.board = board;
			next();
		}
	}

	function gameResponse(req, res) {
		var result = _.get(res.locals, result);
		if (!result) {
			res.status(500);
			next('[gameResponse] missing result on res.locals.result');
		} else {
			res.json(res.locals.result);
		}	
	}

	function trainingResponse (req, res) {
		// we will likely want this to report other information to the client upon completion
		// so, a different response, which would look for analytics on the
		// training that occured such as # of games, time spent, number of turns, number of new
		// nodes created, whatever.
		// var result = _.get(res.locals, result);
		res.json(res.locals);
	}

	function errorResponse (err, req, res, next) {
		console.log('[errorResponse] with error:')
		console.log(err)
		res.json(err);
	}
}