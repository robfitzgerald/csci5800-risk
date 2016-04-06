'use strict';
{
	module.exports = {
		maxPlayers,
		serialize,
		deserialize,
		play,
		generate
	}

	var BoardObject = require('../lib/BoardObject');

	/**
	 * returns the maximum number of players for this game
	 * @return {Number} max number of Risk players
	 */
	function maxPlayers () {
		return 6;
	}

	class riskBoard extends BoardClass {
		constructor (gameNum, gameVariant, players, ) {
			super ()
		}
	}

	function generalize (board) {
		console.log('risk.generalize() called with')
		console.log(board)
	}

	function degeneralize (board) {
		console.log('risk.generalize() called with')
		console.log(board)
	}

	function play (board, action) {
		console.log('risk.play() called with board, action:')
		console.log(board)
		console.log(action)
		return 'result of risk.play()'
	}

	function generate (players) {
		return {
		  gameNumber: 1, // unique game number starting at 1; game of this gameVariant
		  // game variant, to allow us to call out risk_1v1 vs risk_1v2 vs risk_spaceMap 
		  // vs risk_newVersion (all pointing to different trees in neo4j)
		  gameVariant: 'risk_test_1v1',
		  current: {
		    turn: 1, // game turn, starting at 1.
		    player: 0,  // player enumeration of current player (0,1,2..5)
		    unplaced: 0, // beginning of a turn or game, count of unplaced armies 
		    // track if player's fortify move has occured.  this is likely not needed: fortify 
		    // move could be merged into the same action as 'end turn' for all players
		    fortifyMove: false,
		    hasAttacked: false // track if the current player attacked anyone this turn
		    // true if we are currently running repeated MCTS calls for a given AI set in 
		    // currentPlayer.  if true, this forces the feedback loop from client to 
		    // server, to run an AI turn.
		  },
		  countries: [
		    {
		      country: 'Alaska'  // or we could just use the array index of countries[n] for country n
		      owner: 0,  // player enumeration
		      armies: 5  // army count
		    }
		    {
		    	country: 'NorthwestTerritory',
		    	owner: 1,
		    	armies: 5
		    }
		  ],
		  players: [
		    {
		      "type": "AI",   // {'AI'|'Human'} - tells node whether to process with mcts or not
		      "cards": [
		        "cannon"  // {'cannon'|'infantry'|'horse'|'wildcard'} each card the player has
		      ]
		    },
		    {
		    	"type": "AI",
		    	"cards": [
		    		"infantry"
		    	]
		    }
		  ]
		}	
	}
}