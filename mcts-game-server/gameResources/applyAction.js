'use strict';
{
    module.exports = {
        attackall,
        attackhalf,
        fortify,
        placearmy,
        startplace,
        endturn
    }


    var _ = require("lodash")

    function attackall (board, params, wins, losses) {
        var temp = _.cloneDeep(board);

        temp.Countries[params[0]].Armies -= losses;
        temp.Countries[params[1]].Armies -= wins;

        if (temp.Countries[params[1]].Armies < 1) {
            temp.Countries[params[1]].Player = temp.Countries[params[0]].Player;
            temp.Countries[params[1]].Armies = temp.Countries[params[0]].Armies - 1;
            temp.Countries[params[0]].Armies = 1;
        }

        return temp;
    }

    function attackhalf (board, params, wins, losses) {
        var temp = _.cloneDeep(board);

        temp.Countries[params[0]].Armies -= losses;
        temp.Countries[params[1]].Armies -= wins;

        if (temp.Countries[params[1]].Armies < 1) {
            temp.Countries[params[1]].Player = temp.Countries[params[0]].Player;
            
            var moving = Math.round(temp.Countries[params[0]].Armies/2)
            temp.Countries[params[1]].Armies = moving;
            temp.Countries[params[0]].Armies = temp.Countries[params[0]].Armies - moving;
        }

        return temp;
    }

    function placearmy (board, params) {
        var temp = _.cloneDeep(board);

        ++temp.Countries[params[0]].Armies;

        if (!temp.PlayerArmies) {
            --temp.playerDetails[temp.Turn].freeArmies;
            if (temp.playerDetails[temp.Turn].freeArmies == 0) {
                temp.Phase = 'attack';
            }
        } else {
            --temp.PlayerArmies[temp.Turn];
            if (temp.PlayerArmies[temp.Turn] == 0) {
                temp.Phase = 'attack';
            }
        }

        return temp;
    }

    function startplace (board, params) {
        var temp = _.cloneDeep(board);
        // console.log('startplace with temp board:')
        // console.log(temp)
        ++temp.Countries[params[0]].Armies;

        var accum;
        if (!temp.PlayerArmies) {
            --temp.playerDetails[temp.Turn].freeArmies;

            var finished = true;
            for (var i = 0; i < temp.playerDetails.length; ++i) {
                if (temp.playerDetails[i].freeArmies > 0) {
                    finished = false;
                }
            }

            if (finished) {
                temp.Phase = 'placement';
            }

            var accum = 0;
            temp.playerDetails.forEach(function (value) {
                accum += value.freeArmies;
            });

            temp.Turn = (temp.Turn + 1) % temp.Players;

            if (accum == 0) {
                var newArmies = countriesReward(temp);
                newArmies += continentReward(temp);

                temp.playerDetails[temp.Turn].freeArmies += newArmies;
            }

        } else {
            --temp.PlayerArmies[temp.Turn];
            var remaining = _.reduce(temp.PlayerArmies, function(sum, a) { return sum + a;}, 0)
            if (remaining == 0) {
                temp.Phase = 'placement';
            }

            temp.Turn = (temp.Turn + 1) % temp.Players;

            if (remaining == 0) {
                var newArmies = countriesReward(temp);
                newArmies += continentReward(temp);

                temp.PlayerArmies[temp.Turn] += newArmies;
            }
        }

        return temp;
    }

    function fortify (board, params) {
        var temp = _.cloneDeep(board);

        var amount = temp.Countries[params[0]].Armies - 1;
        // console.log('fortify with params: ' + JSON.stringify(params))
        temp.Countries[params[0]].Armies -= amount;
        temp.Countries[params[1]].Armies += amount;
        return endturn(temp, params);
    }

    function endturn (board, params) {
        var temp = _.cloneDeep(board)
        temp.Turn = ((temp.Turn + 1) % temp.Players);
        if (!temp.PlayerArmies) {
            temp.playerDetails[temp.Turn].freeArmies = countriesReward(board) + continentReward(board);            
            temp.moveCount++;
        } else {
            temp.PlayerArmies[temp.Turn] = countriesReward(board) + continentReward(board);
        }
        
        temp.Phase = 'placement';

        return temp;
    }


    function countriesReward (board) {
      var output = Math.floor(_.filter(board.Countries, c => c.Player === board.Turn).length / 3)
      console.log('[applyAction.countriesReward]: awarding player ' + board.Turn + ' with ' + output + ' armies.')
      return output;
    }

    function continentReward (board) {
      var currentTurn = board.Turn
        , thisPlayersCountries = _.filter(
            _.map(board.Countries, function(v, k) {
              return {Name: k, Player: v.Player, Armies: v.Armies}
              }),
            function(country) {
              return country.Player === currentTurn;
              }
            )     
      var output =  _.reduce(
              _.map(continents, function(continent) {
                var diff = _.differenceBy(continent.countries, thisPlayersCountries, function(c) { return c.Name })
                return ((diff.length === 0) ? continent.bonus : 0)
              }),
              function (sum, n) { return sum + n; },
              0);
      console.log('[applyAction.continentReward]: awarding player ' + board.Turn + ' with ' + output + ' armies.')
      return output;
    }




    var continents = { 
        "NorthAmerica": {
            "countries": [
                { "Name": "Alaska" },
                { "Name": "NorthwestTerritory" },
                { "Name": "Greenland" },
                { "Name": "Alberta" },
                { "Name": "Ontario" },
                { "Name": "WesternUnitedStates" },
                { "Name": "EasternUnitedStates" },
                { "Name": "CentralAmerica" }
            ],
            "bonus": 5
        },
        "SouthAmerica": {
            "countries": [
                { "Name": "Venezuela" },
                { "Name": "Peru" },
                { "Name": "Brazil" },
                { "Name": "Argentina" }
            ],
            "bonus": 2
        }
    };
} 