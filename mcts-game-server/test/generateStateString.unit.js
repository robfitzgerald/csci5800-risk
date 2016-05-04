'use strict';
{
	var generateStateString = require('../node_modules/clips-module').generateStateString

	var thisBoard = { Turn: 0,
	 Countries: 
	  { Alaska: { Player: 0, Armies: 12 },
	    NorthwestTerritory: { Player: 1, Armies: 12 },
	    Greenland: { Player: 0, Armies: 3 },
	    Alberta: { Player: 1, Armies: 7 },
	    Ontario: { Player: 0, Armies: 6 },
	    WesternUnitedStates: { Player: 1, Armies: 4 },
	    EasternUnitedStates: { Player: 0, Armies: 6 },
	    CentralAmerica: { Player: 1, Armies: 8 },
	    Venezuela: { Player: 0, Armies: 13 },
	    Peru: { Player: 1, Armies: 4 },
	    Brazil: { Player: 0, Armies: 5 },
	    Argentina: { Player: 1, Armies: 10 } },
	 Phase: 'start',
	 Players: 2,
	 PlayerArmies: [ 1, 1 ] };

	describe('generate state string', function() {
		it('board translated into a clips state string', function() {
			var result = generateStateString(thisBoard);
			console.log(result)
		})
	})


}