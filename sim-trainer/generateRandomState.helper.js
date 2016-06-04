'use strict';

{
    var rules = require(__dirname + '/risk.rules');

    module.exports = () => {
        var result = {};

        // result.Players = Math.floor((Math.random() * MAX_PLAYERS) + 1);
        result.Players = 2;
        result.Turn = 0;
        result.StartingPlayer = 0;
        result.Phase = rules.PHASES[Math.floor(Math.random() * rules.PHASES.length)];
        result.Steps = rules.MAX_STEPS;

        result.PlayerArmies = [];
        for (var i = 0; i < result.Players; ++i) {
            result.PlayerArmies[i] = Math.floor(Math.random() * rules.MAX_PLAYER_ARMIES);
        }
        
        result.Countries = {};
        for (var i = 0; i < rules.COUNTRY_NAMES.length; ++i) {
            result.Countries[rules.COUNTRY_NAMES[i]] = {};
            result.Countries[rules.COUNTRY_NAMES[i]].Player = Math.floor(Math.random() * result.Players);
            result.Countries[rules.COUNTRY_NAMES[i]].Armies = Math.floor(Math.random() * rules.MAX_ARMIES_PER_COUNTRY);
        }

        return result;
    }

}
