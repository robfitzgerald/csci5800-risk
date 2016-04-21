'use strict';
{
	module.exports = {
		expand,
		defaultPolicy
	}

	var currentMock = 0;

	var request = require('request')
		, config = require('config')
		, Q = require('q')
		, uuid = require('node-uuid')
		//, CLIPS = require('../../clips-module')¡

	function expand(parent, move) {
		var deferred = Q.defer();
		// console.log('[CLIPS.expand] called with parent, move:')
		// console.log(parent)
		// console.log(move)
		var thisMock = [mocks[currentMock]]

		// tried and failed to set up each call to expand() to be unique.. this is junk.
		
		setTimeout(function() {		
			thisMock[0].board.Free = uuid.v4();
			currentMock = (currentMock + 1) % mocks.length;
			deferred.resolve(thisMock)
		}, 1001)
		// console.log('** currentMock: ' + currentMock)
		return deferred.promise;
	}

	function defaultPolicy (state) {
		var deferred = Q.defer();
		deferred.resolve(1)
		return deferred.promise;
	}

	var mocks = [
		{
		  board: {
		    "Players": 2,
		    "Phase": "placement",
		    "Free": 5,
		    "Turn": 0,
		    "Steps": 200,
		    "Countries": [
		        {
		            "Name": "Alaska",
		            "Player": 0,
		            "Armies": 5
		        },
		        {
		            "Name": "NorthwestTerritory",
		            "Player": 0,
		            "Armies": 5
		        },
		        {
		            "Name": "Alberta",
		            "Player": 1,
		            "Armies": 10
		        }
		    ]
		  },
		  moves: [
		    {
		        "name": "attack-all",
		        "params": [
		        "Alaska",
		        "Alberta"
		        ]
		    },
		    {
		        "name": "fortify",
		        "params": [
		        "NorthwestTerritory",
		        "Alaska",
		        "1"
		        ]
		    },
		    {
		        "name": "end-turn",
		        "params": []
		    }
		  ]
		},
		{
		  board: {
		    "Players": 2,
		    "Phase": "placement",
		    "Free": 4,
		    "Turn": 1,
		    "Steps": 200,
		    "Countries": [
		        {
		            "Name": "Alaska",
		            "Player": 0,
		            "Armies": 5
		        },
		        {
		            "Name": "NorthwestTerritory",
		            "Player": 0,
		            "Armies": 5
		        },
		        {
		            "Name": "Alberta",
		            "Player": 1,
		            "Armies": 10
		        }
		    ]
		  },
		  moves: [
		    {
		        "name": "attack-norbert",
		        "params": [
		        "Alaska",
		        "Alberta"
		        ]
		    },
		    {
		        "name": "fortify",
		        "params": [
		        "NorthwestTerritory",
		        "Alaska",
		        "1"
		        ]
		    },
		    {
		        "name": "end-turn",
		        "params": []
		    }
		  ]
		},
		{
		  board: {
		    "Players": 2,
		    "Phase": "i should be terminal",
		    "Free": 3,
		    "Turn": 2,
		    "Steps": 200,
		    "Countries": [
		        {
		            "Name": "Alaska",
		            "Player": 0,
		            "Armies": 5
		        },
		        {
		            "Name": "NorthwestTerritory",
		            "Player": 0,
		            "Armies": 5
		        },
		        {
		            "Name": "Alberta",
		            "Player": 1,
		            "Armies": 10
		        }
		    ]
		  },
		  moves: []
		}
	];
}