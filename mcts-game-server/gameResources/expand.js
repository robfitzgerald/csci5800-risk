'use strict';
{
    module.exports = {
        placearmy
    }

    var _ = require('lodash')
        , async = require('async')
        , clips = require('clips-module')
        , Q = require('q')

    function placearmy (generalizedBoard, action) {
        var deferred = Q.defer();

        // Modify the board
        var temp = _.cloneDeep(generalizedBoard);

        _.update(temp, 'Countries[' + action.params[0] + '].armies', function (value) {
            return value + 1;
        });
        _.update(temp, 'PlayerArmies[0]', function (value) {
            return value - 1;
        });
        if (temp.PlayerArmies[generalizedBoard.Turn] == 0) {
            _.set(temp, 'Phase', 'attack');
        }

        clips.generateChildren(temp).then(function (value) {
            var arr = [value];
            deferred.resolve(arr);
        });

        return deferred.promise;
    }



}