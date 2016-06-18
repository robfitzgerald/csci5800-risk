'use strict';

{
    var rules = require(__dirname + '/risk.rules');

    var empty = [0, 0, 0, 0, 0, 0, 0];

    module.exports = state => {
        var builderArray = [];
        for (var i = 0; i < 10; ++i) {
            builderArray[i] = [];
            for (var j = 0; j < 10; ++j) {
                builderArray[i][j] = empty;
            }
        }

        for (var i = 0; i < rules.COUNTRY_NAMES.length; ++i) {
            var arr = [];
            var country = rules.COUNTRY_NAMES[i];
            var adjacencies = rules.ADJACENCIES[country];

            var player = state.Countries[country].Player;
            var sign = (player == state.Turn) ? 1 : -1;
            arr[0] = sign*state.Countries[country].Armies;
            for (var j = 1; j < adjacencies.length+1; ++j) {
                var innerCountry = adjacencies[j-1];
                if (innerCountry === 'null') {
                    arr[j] = 0;
                } else {
                    var innerSign = (state.Countries[innerCountry].Player === state.Turn) ? 1 : -1;
                    arr[j] = innerSign*state.Countries[innerCountry].Armies;
                }

            }

            var indices = rules.LOCATIONS[country];
            builderArray[indices[0]][indices[1]] = arr;
        }

        return builderArray;
    }

}