'use strict';
{
	module.exports = {
		expand,
		defaultPolicy
	}

	var request = require('request')
		, config = require('config')
		, Q = require('q')
		//, CLIPS = require('../../clips-module')¡

	function expand(parent, move) {
		var deferred = Q.defer();
		// console.log('[CLIPS.expand] called with parent, move:')
		// console.log(parent)
		// console.log(move)
		deferred.resolve([mock1,mock2])
		return deferred.promise;
	}

	function defaultPolicy (state) {
		var deferred = Q.defer();
		deferred.resolve(Math.round(Math.random()))
		return deferred.promise;
	}

	var mock1 = {
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
	  actions: [
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
	        1
	        ]
	    },
	    {
	        "name": "end-turn",
	        "params": []
	    }
	  ]
	}

	var mock2 = {
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
	  actions: [
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
	        1
	        ]
	    },
	    {
	        "name": "end-turn",
	        "params": []
	    }
	  ]
	}

}