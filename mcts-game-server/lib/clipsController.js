'use strict';
{
	module.exports = {
		expand
	}

	var request = require('request')
		, config = require('config')
		, Q = require('q')
		, CLIPS = request.defaults({
		method: 'POST',
		url: config.get('clips.baseUrl'),
	})

	function expand(parent, move) {
		var deferred = Q.defer();
		console.log('[CLIPS.expand] called with parent, move:')
		console.log(parent)
		console.log(move)
		deferred.resolve([{
			state: 'new board state at' + Date.now(),
			moves: [{name: "attack-all", params:['alberta', 'alaska']}],
			nonTerminal: true
		}])
		return deferred.promise;
	}
}