'use strict';
{
    module.exports = {
        fortifymove,
        placearmy,
        startplace
    }

    let _ = require('lodash')
        , applyAction = require('./applyAction')
        , async = require('async')
        , clips = require('clips-module')
        , Q = require('q')

    function attackhalf (generalizedBoard, action) {
        let deferred = Q.defer();

        let aRolls;
        let aArmies = Math.round(generalizedBoard.Countries[action.params[0]].Armies);
        if (aArmies > 3) {
            aRolls = 3;
        } else if (aArmies > 2) {
            aRolls = 2;
        } else {
            aRolls = 1;
        }

        let dRolls;
        let dArmies = generalizedBoard.Countries[action.params[1]].Armies;
        if (dArmies > 1) {
            dRolls = 2;
        } else {
            dRolls = 1;
        }

        let rolls = Math.max(aRolls, dRolls);
        let results = [];
        let arr = [];
        for (let i = 0; i < rolls; ++i) {
            arr.push(i);
        }

        async.each(arr, function(wins, callback) {
            let temp = applyAction.attackhalf(generalizedBoard, action.params, wins, rolls-wins);
            clips.generateChildren(temp).then(function (value) {
                result.push(value);
            });
        }, function (err) {
            deferred.resolve(arr);
        });

        return deferred.promise;
    }

    function attackall (generalizedBoard, action) {
        let deferred = Q.defer();

        let aRolls;
        let aArmies = generalizedBoard.Countries[action.params[0]].Armies;
        if (aArmies > 3) {
            aRolls = 3;
        } else if (aArmies > 2) {
            aRolls = 2;
        } else {
            aRolls = 1;
        }

        let dRolls;
        let dArmies = generalizedBoard.Countries[action.params[1]].Armies;
        if (dArmies > 1) {
            dRolls = 2;
        } else {
            dRolls = 1;
        }

        let rolls = Math.max(aRolls, dRolls);
        let results = [];
        let arr = [];
        for (let i = 0; i < rolls; ++i) {
            arr.push(i);
        }

        async.each(arr, function(wins, callback) {
            let temp = applyAction.attackall(generalizedBoard, action.params, wins, rolls-wins);
            clips.generateChildren(temp).then(function (value) {
                result.push(value);
            });
        }, function (err) {
            deferred.resolve(arr);
        });

        return deferred.promise;
    }

    function fortifymove (generalizedBoard, action) {
        let deferred = Q.defer();

        let temp = applyAction.fortifymove(generalizedBoard, action.params);

        clips.generateChildren(temp).then(function (value) {
            let arr = [value];
            deferred.resolve(arr);
        });

        return deferred.promise;
    }

    function startplace (generalizedBoard, action) {
        let deferred = Q.defer();

        let temp = applyAction.startplace(generalizedBoard, action.params);

        clips.generateChildren(temp).then(function (value) {
            let arr = [value];
            deferred.resolve(arr);
        });

        return deferred.promise;
    }


    function placearmy (generalizedBoard, action) {
        let deferred = Q.defer();

        // Modify the board
        let temp = applyAction.placearmy(generalizedBoard, action.params);

        clips.generateChildren(temp).then(function (value) {
            let arr = [value];
            deferred.resolve(arr);
        });

        return deferred.promise;
    }



}