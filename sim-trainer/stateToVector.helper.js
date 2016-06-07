'use strict';

{
    var rules = require(__dirname + '/risk.rules')
        , _ = require('lodash')
        , v = require('vectorious')
        , Vector = v.Vector
        , Matrix = v.Matrix;

    module.exports = (state) => {
        var builderArray = [];
        builderArray.push(state.Players);
        builderArray.push(state.Turn);
        builderArray.push(state.StartingPlayer);
        rules.PHASES.forEach( (currentItem, index, array) => {
            if (currentItem === state.Phase) {
                builderArray.push(index);
            }
        });
        for (var i = 0; i < rules.MAX_PLAYERS; ++i) {
            if (state.PlayerArmies.length > i) {
                builderArray.push(state.PlayerArmies[i]);
            } else {
                builderArray.push(0);
            }
        }
        for (var i = 0; i < rules.COUNTRY_NAMES.length; ++i) {
            var player = state.Countries[rules.COUNTRY_NAMES[i]].Player;
            var sign = (player == state.Turn) ? 1 : -1;
            builderArray.push(player);
            builderArray.push(sign*state.Countries[rules.COUNTRY_NAMES[i]].Armies);
        }

        // Bias
        builderArray.push(1);
        return builderArray;

        // var result = new Matrix([builderArray]);

        // return result;
    }
}
