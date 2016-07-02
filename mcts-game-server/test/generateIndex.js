'use strict'
{
	var helper = require('../database/database.helper')
		, variant = require('../gameVariant/risk')

	// var board = { Turn: 0,
 //  Countries: 
 //   { Alaska: { Player: 0, Armies: 10 },
 //     NorthwestTerritory: { Player: 1, Armies: 6 },
 //     Greenland: { Player: 0, Armies: 8 },
 //     Alberta: { Player: 1, Armies: 12 },
 //     Ontario: { Player: 0, Armies: 7 },
 //     WesternUnitedStates: { Player: 1, Armies: 4 },
 //     EasternUnitedStates: { Player: 0, Armies: 4 },
 //     CentralAmerica: { Player: 1, Armies: 9 },
 //     Venezuela: { Player: 0, Armies: 12 },
 //     Peru: { Player: 1, Armies: 12 },
 //     Brazil: { Player: 0, Armies: 7 },
 //     Argentina: { Player: 1, Armies: 3 } },
 //  Phase: 'attack',
 //  Players: 2,
 //  PlayerArmies: [ 0, 0 ] };
  var board = {"Turn":0,"Countries":{"Alaska":{"Player":0,"Armies":10},"NorthwestTerritory":{"Player":1,"Armies":6},"Greenland":{"Player":0,"Armies":10},"Alberta":{"Player":1,"Armies":10},"Ontario":{"Player":0,"Armies":5},"WesternUnitedStates":{"Player":1,"Armies":6},"EasternUnitedStates":{"Player":0,"Armies":8},"CentralAmerica":{"Player":1,"Armies":7},"Venezuela":{"Player":0,"Armies":9},"Peru":{"Player":1,"Armies":10},"Brazil":{"Player":0,"Armies":1},"Argentina":{"Player":1,"Armies":6}},"Phase":"attack","Players":2,"PlayerArmies":[0,0]}
  // var newBoard = {"Turn":1,"Countries":{"Alaska":{"Player":0,"Armies":4},"NorthwestTerritory":{"Player":1,"Armies":10},"Greenland":{"Player":0,"Armies":6},"Alberta":{"Player":1,"Armies":9},"Ontario":{"Player":0,"Armies":6},"WesternUnitedStates":{"Player":1,"Armies":4},"EasternUnitedStates":{"Player":0,"Armies":12},"CentralAmerica":{"Player":1,"Armies":6},"Venezuela":{"Player":0,"Armies":7},"Peru":{"Player":1,"Armies":4},"Brazil":{"Player":0,"Armies":11},"Argentina":{"Player":1,"Armies":12}},"Phase":"attack","Players":2,"PlayerArmies":[0,1]}
  // var asdf = {"Turn":1,"Countries":{"Alaska":{"Player":0,"Armies":4},"NorthwestTerritory":{"Player":1,"Armies":10},"Greenland":{"Player":0,"Armies":6},"Alberta":{"Player":1,"Armies":9},"Ontario":{"Player":0,"Armies":6},"WesternUnitedStates":{"Player":1,"Armies":4},"EasternUnitedStates":{"Player":0,"Armies":12},"CentralAmerica":{"Player":1,"Armies":6},"Venezuela":{"Player":0,"Armies":7},"Peru":{"Player":1,"Armies":4},"Brazil":{"Player":0,"Armies":11},"Argentina":{"Player":1,"Armies":12}},"Phase":"start","Players":2,"PlayerArmies":[0,1]}

  var result = helper.hash(helper.serialize(board));
  console.log('index: ' + result);
  // console.log(asdf)
  // console.log(newBoard)
}