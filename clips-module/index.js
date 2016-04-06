'use strict';

var clips = require('./build/Release/clipslib.node');
var Q = require('q');

var simulate = function (state) {
    var deferred = Q.defer();
    deferred.resolve('' + clips.runSimulation(generateStateString(state)));

    return deferred.promise;
}

var generateChildren = function (state, move) {
    var deferred = Q.defer();
    deferred.resolve(clips.generateActions(generateStateString(state)));

    return deferred.promise;
}

var generateStateString = function (state) {
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

exports.simulate = simulate;
exports.generateChildren = generateChildren;
