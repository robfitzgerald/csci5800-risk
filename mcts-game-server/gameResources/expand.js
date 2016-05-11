'use strict';
{
    module.exports = {
        fortify,
        placearmy,
        startplace,
        attackhalf,
        attackall,
        endturn
    }

    var _ = require('lodash')
        , applyAction = require('./applyAction')
        , async = require('async')
        , clips = require('clips-module')
        , Q = require('q')

    function attackhalf (generalizedBoard, action) {
        var deferred = Q.defer();

        var aRolls;
        var aArmies = Math.round(generalizedBoard.Countries[action.params[0]].Armies);
        if (aArmies > 3) {
            aRolls = 3;
        } else if (aArmies > 2) {
            aRolls = 2;
        } else {
            aRolls = 1;
        }

        var dRolls;
        var dArmies = generalizedBoard.Countries[action.params[1]].Armies;
        if (dArmies > 1) {
            dRolls = 2;
        } else {
            dRolls = 1;
        }

        var rolls = Math.min(aRolls, dRolls);
        var result = [];
        var arr = [];
        for (var i = 0; i <= rolls; ++i) {
            arr.push(i);
        }

        console.log('in attackhalf, applying action with arr = ' + JSON.stringify(arr))

        async.each(arr, function(wins, callback) {
            console.log('this wins value: ' + wins)
            var temp = applyAction.attackhalf(generalizedBoard, action.params, wins, rolls-wins);
            clips.generateChildren(temp).then(function (value) {
                result.push(value);
                callback();
            });
        }, function (err) {
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    function attackall (generalizedBoard, action) {
        var deferred = Q.defer();

        var aRolls;
        var aArmies = generalizedBoard.Countries[action.params[0]].Armies;
        if (aArmies > 3) {
            aRolls = 3;
        } else if (aArmies > 2) {
            aRolls = 2;
        } else {
            aRolls = 1;
        }

        var dRolls;
        var dArmies = generalizedBoard.Countries[action.params[1]].Armies;
        if (dArmies > 1) {
            dRolls = 2;
        } else {
            dRolls = 1;
        }

        var rolls = Math.min(aRolls, dRolls);
        var result = [];
        var arr = [];
        for (var i = 0; i <= rolls; ++i) {
            arr.push(i);
        }

        async.each(arr, function(wins, callback) {
            var temp = applyAction.attackall(generalizedBoard, action.params, wins, rolls-wins);
            clips.generateChildren(temp).then(function (value) {
                result.push(value);
                callback();
            });
        }, function (err) {
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    function fortify (generalizedBoard, action) {
        var deferred = Q.defer();

        var temp = applyAction.fortify(generalizedBoard, action.params);

        clips.generateChildren(temp).then(function (value) {
            var arr = [value];
            deferred.resolve(arr);
        });

        return deferred.promise;
    }

    function startplace (generalizedBoard, action) {
        var deferred = Q.defer();

        var temp = applyAction.startplace(generalizedBoard, action.params);

        clips.generateChildren(temp).then(function (value) {
            var arr = [value];
            deferred.resolve(arr);
        })
        .catch(function(err) {
            deferred.reject(err);
        })

        return deferred.promise;
    }


    function placearmy (generalizedBoard, action) {
        var deferred = Q.defer();

        // Modify the board
        var temp = applyAction.placearmy(generalizedBoard, action.params);

        clips.generateChildren(temp).then(function (value) {
            var arr = [value];
            deferred.resolve(arr);
        });

        return deferred.promise;
    }

    function endturn (generalizedBoard, action) {
        var deferred = Q.defer();

        var temp = applyAction.endturn(generalizedBoard, action.params);

        clips.generateChildren(temp).then(function (value) {
            var arr = [value];
            deferred.resolve(arr);
        });

        return deferred.promise;
    }

}