var _ = require('lodash');

(function () {

    'use strict';

    var clips = require('./build/Release/clipslib.node');
    var Q = require('q');

    var simulate = function (state) {
        var deferred = Q.defer();
        
        runClipsSim(state, function (err, result) {
            deferred.resolve('' + result);
        });

        return deferred.promise;
    }

    var runClipsSim = function (s, callback) {
        var result = clips.runSimulation(generateStateString(s));
        callback(null, result);
    }

    var generateChildren = function (state, move, callback) {
        var deferred = Q.defer();

        runClipsActions(state, function (err, result) {
            var actions = {};
            actions.board = state;

            actions.actions = [];

            var split = result.split("\n\n");

            split.forEach(function (value) {
                if (value === '') {
                    return;
                }

                var lines = value.split("\n");

                var actionName = getActionName(lines[0]);

                if (actionName == "placearmy") {
                    actions.actions.push(generatePlaceArmyAction(lines));
                } else if (actionName == "startplace") {
                    actions.actions.push(generateStartPlaceAction(lines));
                } else if (actionName == "attackall") {
                    actions.actions.push(generateAttackAction(state, lines, "attackall"));
                } else if (actionName == "attackhalf") {
                    actions.actions.push(generateAttackAction(state, lines, "attackhalf"));
                } else if (actionName == "fortifymove") {
                    actions.actions.push(generateFortifyAction(lines));
                } else if (actionName == "nextturn") {
                    actions.actions.push({"name":"endturn", "params":[]});
                }
            });

            deferred.resolve(actions);
        });

        return deferred.promise;

    }

    var runClipsActions = function (s, callback) {
        var result = clips.generateActions(generateStateString(s));
        callback(null, result);
    }

    var getControlsInfo = function (line) {
        var result = {};

        line = line.trim();

        if (!line.startsWith("(controls")) {
            return null;
        }

        var country = line.match(/\(country [a-zA-Z]+\)/);
        result.country = country[0].substring(9, country[0].length-1);

        var player = line.match(/\(player [0-9]+\)/);
        result.player = player[0].substring(8, player[0].length-1);

        return result;
    }

    var getActionName = function (line) {
        line = line.trim();

        var actionName = line.substring(0, line.length-1);
        return actionName.replace(/-/g, "");
    }

    var generateStateString = function (state) {
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

    var generatePlaceArmyAction = function (lines) {
        var action = {};

        action.name = "placearmy";
        action.params = [];

        lines.forEach(function (value) {
            value = value.trim();

            if (value.startsWith("(controls")) {
                action.params.push(getControlsInfo(value).country);
            }
        });

        return action;
    }

    var generateStartPlaceAction = function (lines) {
        var action = {};

        action.name = "startplace";
        action.params = [];

        lines.forEach(function (value) {
            value = value.trim();

            if (value.startsWith("(controls")) {
                action.params.push(getControlsInfo(value).country);
            }
        });

        return action;
    }

    var generateAttackAction = function (state, lines, name) {
        var action = {};

        action.name = name;
        action.params = [];

        lines.forEach(function (value) {
            value = value.trim();

            var temp = {};
            if (value.startsWith("(controls")) {
                temp = getControlsInfo(value);

                if (temp.player == state.Turn) {
                    action.params[0] = temp.country;
                } else {
                    action.params[1] = temp.country;
                }
            }
        });

        return action;
    }

    var generateFortifyAction = function (lines) {
        var action = {};

        action.name = "fortify";
        action.params = [];

        lines.forEach(function (value) {
            value = value.trim();
            console.log(value);
            if (value.startsWith("(controls")) {
                action.params.push(getControlsInfo(value).country);
            }
        });

        return action;
    }

    exports.simulate = simulate;
    exports.generateChildren = generateChildren;

})();
