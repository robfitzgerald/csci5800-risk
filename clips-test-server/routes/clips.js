'use strict';

var express = require('express');
var router = express.Router();
var clips = require('clips-module');

var state = {
    "gameNumber": 1972,
    "gameVariant": "Risk",
    "moveCount": 0,
    "PlayerArmies": [ 10, 10 ],
    "Players": 2,
    "Phase": "attack",
    "Turn": 0,
    "Steps": 100000,
    "Countries": {
        "Alaska":
            {
                "Player": 0,
                "Armies": 5
            },
        "NorthwestTerritory":
            {
                "Player": 0,
                "Armies": 10
            },
        "Greenland":
            {
                "Player": 1,
                "Armies": 1
            },
        "Alberta":
            {
                "Player": 1,
                "Armies": 10
            },
        "Ontario":
            {
                "Player": 0,
                "Armies": 2
            },
        "WesternUnitedStates":
            {
                "Player": 0,
                "Armies": 4
            },
        "EasternUnitedStates":
            {
                "Player": 1,
                "Armies": 7
            },
        "CentralAmerica":
            {
                "Player": 0,
                "Armies": 1
            },
        "Venezuela":
            {
                "Player": 0,
                "Armies": 4
            },
        "Peru":
            {
                "Player": 1,
                "Armies": 2
            },
        "Brazil":
            {
                "Player": 1,
                "Armies": 3
            },
        "Argentina":
            {
                "Player": 0,
                "Armies": 3
            }
    }
};

var sim = function (req, res) {
    clips.simulate(state).then(function (value) {
        res.send(value);
    });
}

var actions = function (req, res) {
    clips.generateChildren(state).then(function (value) {
        res.send(value);
    });
}

router
    .get('/sim', sim)
    .get('/actions', actions);

module.exports = router;