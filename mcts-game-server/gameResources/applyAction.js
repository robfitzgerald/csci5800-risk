'use strict';
{
    module.exports = {
        attackall,
        attackhalf,
        fortify,
        placearmy,
        startplace
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
        console.log('startplace with temp board:')
        console.log(temp)
        ++temp.Countries[params[0]].Armies;

        var accum;
        if (!temp.PlayerArmies) {
            --temp.playerDetails[temp.Turn].freeArmies;

            var finished = true;
            for (var i = 0; i < temp.playerDetails.length; ++i) {
                console.log('at i = ' + i + ', conditional is ' + (temp.playerDetails[i].freeArmies > 0))
                if (temp.playerDetails[i].freeArmies > 0) {
                    finished = false;
                }
            }

            if (finished) {
                console.log('finished found to be true - changing to placement')
                temp.Phase = 'placement';
            }

            var accum = 0;
            temp.playerDetails.forEach(function (value) {
                accum += value.freeArmies;
            });

            console.log('remaining free armies = ' + accum)

            temp.Turn = (temp.Turn + 1) % temp.Players;

            console.log('new turn is ' + temp.Turn)

            if (accum == 0) {
                console.log('no armies left on board. determining reward for new player')
                var newArmies = countriesReward(temp);
                newArmies += continentReward(temp);

                console.log('new armies is ' + newArmies)
                temp.playerDetails[temp.Turn].freeArmies += newArmies;
            }

        } else {
            console.log('*** startplace for generalized board on expand()')
            --temp.PlayerArmies[temp.Turn];
            var remaining = _.reduce(temp.PlayerArmies, function(sum, a) { return sum + a;}, 0)
            if (remaining == 0) {
                temp.Phase = 'placement';
            }

            temp.Turn = (temp.Turn + 1) % temp.Players;

            console.log('remaining is now ' + remaining + ', phase is ' + temp.Phase + ', player turn is ' + temp.Turn)

            if (remaining == 0) {
                console.log('no armies left on board. determining reward for new player')
                var newArmies = countriesReward(temp);
                newArmies += continentReward(temp);

                console.log('new armies is ' + newArmies)

                temp.PlayerArmies[temp.Turn] += newArmies;
            }
        }

        return temp;
    }

    function fortify (board, params) {
        var temp = _.cloneDeep(temp);

        var amount = temp.Countries[params[0]].Armies - 1;

        temp.Countries[params[0]].Armies -= amount;
        temp.Countries[params[1]].Armies += amount;

        return temp;
    }


    function countriesReward (board) {
      return Math.floor(_.filter(board.Countries, c => c.Player === board.Turn).length / 3)
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
      return _.reduce(
              _.map(continents, function(continent) {
                var diff = _.differenceBy(continent.countries, thisPlayersCountries, function(c) { return c.Name })
                return ((diff.length === 0) ? continent.bonus : 0)
              }),
              function (sum, n) { return sum + n; },
              0);
      
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