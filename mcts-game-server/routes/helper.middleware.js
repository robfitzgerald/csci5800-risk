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
		} else {
			var board = req.body;
			delete board.action;
			res.locals.action = action;
			res.locals.board = board;
			next();
		}
	}

	function gameResponse(req, res, next) {
		if (res.statusCode >= 400) {
			var errorMessage = _.get(res.locals, 'error');
			if (errorMessage) {
				console.log('[gameResponse] error: ' + res.locals.error)				
				res.json(new Error(res.locals.error));	
			} else {
				console.log('[gameResponse] warning!  error caught at response, but no error set on res.locals.error!')
				res.json(new Error('the server experienced an error. no other information provided.'))
			}
		} else {
			res.json(res.locals.result);
		}
	}
}