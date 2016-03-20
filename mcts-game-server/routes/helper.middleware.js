'use strict';
{
	var _ = require('lodash');

	module.exports = {
		skipMCTS,
		gameResponse
	}

	function skipMCTS(req, res, next) {
		var action = _.get(req.body, 'action')
		if (!action) {
	 		res.locals.error = '[skipMCTS] Error: action missing from request body';
	 		res.status(400);
	 		next();			
		}
		var board = req.body;
		delete board.action;
		res.locals.action = action;
		res.locals.board = board;
		next();
	}

	function gameResponse(err, req, res, next) {
		if (err) {
			res.json(new Error(res.locals.error));
		} else {
			res.json(res.locals.result);
		}
	}
}