'use strict';
{
    module.exports = {
        fortifymove,
        placearmy,
        startplace
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

        var rolls = Math.max(aRolls, dRolls);
        var results = [];
        var arr = [];
        for (int i = 0; i < rolls; ++i) {
            arr.push(i);
        }

        async.each(arr, function(wins, callback) {
            var temp = applyAction.attackhalf(generalizedBoard, action.params, wins, rolls-wins);
            clips.generateChildren(temp).then(function (value) {
                result.push(value);
            });
        }, function (err) {
            deferred.resolve(arr);
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

        var rolls = Math.max(aRolls, dRolls);
        var results = [];
        var arr = [];
        for (int i = 0; i < rolls; ++i) {
            arr.push(i);
        }

        async.each(arr, function(wins, callback) {
            var temp = applyAction.attackall(generalizedBoard, action.params, wins, rolls-wins);
            clips.generateChildren(temp).then(function (value) {
                result.push(value);
            });
        }, function (err) {
            deferred.resolve(arr);
        });

        return deferred.promise;
    }

    function fortifymove (generalizedBoard, action) {
        var deferred = Q.defer();

        var temp = applyAction.fortifymove(generalizedBoard, action.params);

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
        });

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



}