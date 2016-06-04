'use strict';

{
    var clips = require('./build/Release/clipslib')
        , _ = require('lodash');

    function runClipsSim (s) {
        return clips.runSimulation(generateStateString(s));
    }

    function generateStateString (state) {
        var result = "";

        if (state.Turn !== null) {
            result += "(starting-player " + state.Turn + "),";
            result += "(turn " + state.Turn + ")";
        } else {
            result += "(starting-player 0),";
            result += "(turn 0)";
        }

        if (state.Players !== null) {
            result += ",(players " + state.Players + ")";
        }

        if (state.Phase !== null) {
            result += ",(phase (current " + state.Phase + "))";
        }

        if (state.PlayerArmies != null) {
            state.PlayerArmies.forEach(function(value, index) {
                result += ",(free-armies (player " + index + ") (num " + value + "))";
            });
        }

        if (state.Steps != null) {
            result += ",(steps " + state.Steps + ")";
        }

        if (state.Countries !== null) {
            _.forEach(state.Countries, function(value, key) {
                result += ",(controls (country " + key + ") (player " + value.Player + "))";
                result += ",(armies (country " + key + ") (num " + value.Armies + "))";
            });
        }

        return result;
    }

    module.exports = runClipsSim;

}
