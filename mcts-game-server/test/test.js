// driver-style test file

'use strict';
{
	var boards = require('../lib/boards');
	var mcts = require('../routes/mcts.middleware');
	var game = require('../routes/game.middleware');
	var req = {
		body: {
			action: 'poodle',
			otherStuff: 'stuff'
		},
		params: {
			variant: 'risk'
		}
	}
	var res = {
		locals: {},
		status: function(n) {console.log('res.status set to ' + n)}
	}
	mcts(req, res, function() {
		console.log('mcts req, res:')
		console.log(req)
		console.log(res)
	});

	// game(req, res, function() {
	// 	console.log('game req, res:')
	// 	console.log(req)
	// 	console.log(res)
	// })

}