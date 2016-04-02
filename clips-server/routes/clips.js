'use strict';

var express = require('express');
var router = express.Router();
var clips = require('../build/Release/clipslib.node');

var state = {
    "Players": 2,
    "Phase": "placement",
    "Free": 2,
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
    var result = clips.runSimulation(generateStateString(state));

    res.send('' + result);
}

var actions = function (req, res) {
    var result = clips.generateActions(generateStateString(state));

    res.send(result);
}

router
    .get('/sim', sim)
    .get('/actions', actions);

var generateStateString = function (stateObject) {
    var result = "";

    if (state.Turn !== null) {
        result += "(turn " + state.Turn + ")";
    } else {
        result += "(turn 0)";
    }

    if (state.Players !== null) {
        result += ",(players " + state.Players + ")";
    }

    if (state.Phase !== null) {
        result += ",(phase (current " + state.Phase + "))";
    }

    if (state.Free !== null) {
        result += ",(free-armies " + state.Free + ")";
    }

    if (state.Steps != null) {
        result += ",(steps " + state.Steps + ")";
    }

    if (state.Countries !== null) {
        for (var i = 0; i < state.Countries.length; ++i) {
            result += ",(controls (country " + state.Countries[i].Name + ") (player " + state.Countries[i].Player + "))";
            result += ",(armies (country " + state.Countries[i].Name + ") (num " + state.Countries[i].Armies + "))";
        }
    }

    return result;
}

module.exports = router;