'use strict';

var express = require('express');
var router = express.Router();
var clips = require('clips-module');

var state = {
    "Players": 2,
    "Phase": "placement",
    "Free": 2,
    "Turn": 0,
    "Steps": 1000,
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
            "Name": "Greenland",
            "Player": 1,
            "Armies": 1
        },
        {
            "Name": "Alberta",
            "Player": 1,
            "Armies": 10
        },
        {
            "Name": "Ontario",
            "Player": 0,
            "Armies": 2
        },
        {
            "Name": "WesternUnitedStates",
            "Player": 0,
            "Armies": 4
        },
        {
            "Name": "EasternUnitedStates",
            "Player": 1,
            "Armies": 7
        },
        {
            "Name": "CentralAmerica",
            "Player": 0,
            "Armies": 1
        },
        {
            "Name": "Venezuela",
            "Player": 0,
            "Armies": 4
        },
        {
            "Name": "Peru",
            "Player": 1,
            "Armies": 2
        },
        {
            "Name": "Brazil",
            "Player": 1,
            "Armies": 3
        },
        {
            "Name": "Argentina",
            "Player": 0,
            "Armies": 3
        }
    ]
};

var sim = function (req, res) {
    clips.simulate(state).then(function (value) {
        res.send(value);
    });
}

var actions = function (req, res) {
    clips.generateActions(state).then(function (value) {
        res.send(value);
    });
}

router
    .get('/sim', sim)
    .get('/actions', actions);

module.exports = router;