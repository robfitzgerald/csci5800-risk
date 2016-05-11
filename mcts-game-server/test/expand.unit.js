'use strict';
{
	var variant = require('../gameVariant/risk')
	var clips = require('../node_modules/clips-module')
	var generateChildren = clips.generateChildren

	var startingBoard = { Turn: 1,
	  Countries: 
	   { Alaska: { Player: 0, Armies: 5 },
	     NorthwestTerritory: { Player: 1, Armies: 5 },
	     Greenland: { Player: 0, Armies: 6 },
	     Alberta: { Player: 1, Armies: 5 },
	     Ontario: { Player: 0, Armies: 9 },
	     WesternUnitedStates: { Player: 1, Armies: 8 },
	     EasternUnitedStates: { Player: 0, Armies: 6 },
	     CentralAmerica: { Player: 1, Armies: 10 },
	     Venezuela: { Player: 0, Armies: 11 },
	     Peru: { Player: 1, Armies: 7 },
	     Brazil: { Player: 0, Armies: 8 },
	     Argentina: { Player: 1, Armies: 9 } },
	  Phase: 'start',
	  Players: 2,
	  PlayerArmies: [ 1, 2 ] 
	}
	var move = { name: 'startplace', params: [ 'Peru' ] }
	var resultingBoard = { Turn: 0,
	  Countries: 
	   { Alaska: { Player: 0, Armies: 5 },
	     NorthwestTerritory: { Player: 1, Armies: 5 },
	     Greenland: { Player: 0, Armies: 6 },
	     Alberta: { Player: 1, Armies: 5 },
	     Ontario: { Player: 0, Armies: 9 },
	     WesternUnitedStates: { Player: 1, Armies: 8 },
	     EasternUnitedStates: { Player: 0, Armies: 6 },
	     CentralAmerica: { Player: 1, Armies: 10 },
	     Venezuela: { Player: 0, Armies: 11 },
	     Peru: { Player: 1, Armies: 8 },
	     Brazil: { Player: 0, Armies: 8 },
	     Argentina: { Player: 1, Armies: 9 } },
	  Phase: 'start',
	  Players: 2,
	  PlayerArmies: [ 1, 1 ] 
	}

	describe('expanding this meddlesome action/move pair', function() {
		this.timeout(10000);
		it.skip('should work within 10000 ms', function(done) {
			variant.expand(startingBoard,move)
				.then(function(result) {
					console.log(result);
					done();
				})
				.catch(function(err) {
					done(err);
				})
		})
		it.skip('calling generateChildren directly with result board should do stuff', function(done) {
			generateChildren(resultingBoard)
				.then(function(res) {
					console.log('done with result')
					console.log(JSON.stringify(res))
					done()
				})
				.catch(function(err) {
					done(err)
				})
		})
	})
}