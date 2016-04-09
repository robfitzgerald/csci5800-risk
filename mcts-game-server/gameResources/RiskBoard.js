'use strict';
{

  var BoardObject = require ('../lib/BoardObject')
    , _ = require('lodash')
    , config = require('config')

  module.exports = class RiskBoard extends BoardObject {
    constructor (gameNum, variant, players) {
      super (gameNum, variant, players);
      this.Phase = 'attack';
      this.Countries = setupCountries(this.Players);
      this.Free = 0;
      this.Steps = config.get('clips.steps');
    }

    /**
     * advances the board player to the next player and issues
     * armies that can be placed by the new player.
     */
    endTurn () {
      this.Turn = ((this.Turn + 1) % this.Players);
      this.Free = Math.floor(_.filter(this.Countries, c => c.Player === this.Turn).length / 3);
      this.Phase = 'placement';
    }
    
  }

  /**
   * distributes the countries evenly and evenly populates them with armies
   * @param  {Number} numPlayers - number of players
   * @return {Object[]}          - array of country objects
   */
  function setupCountries(numPlayers) {
    var countries = [
      { "Name": "Alaska" },
      { "Name": "NorthwestTerritory" },
      { "Name": "Greenland" },
      { "Name": "Alberta" },
      { "Name": "Ontario" },
      { "Name": "WesternUnitedStates" },
      { "Name": "EasternUnitedStates" },
      { "Name": "CentralAmerica" },
      { "Name": "Venezuela" },
      { "Name": "Peru" },
      { "Name": "Brazil" },
      { "Name": "Argentina" }
    ]
      , totalArmiesOnBoard = [null, null, 80, 115, 120, 125, 120][numPlayers]
      , stepPlayer = 0
      , countriesShuffled = _.shuffle(countries);
    totalArmiesOnBoard -= countries.length;

    // choose country owner
    _.forEach(countriesShuffled, function(country) {
      country.Player = stepPlayer;
      country.Armies = 1;
      stepPlayer = ((stepPlayer + 1) % numPlayers)
    })

    // place armies evenly
    // j cycles all country indices; i occurs as many times as there are armies to place
    var j = 0;
    for (var i = 0; i < totalArmiesOnBoard; ++i) {
      countriesShuffled[j].Armies++;
      j++;
      j = j % countriesShuffled.length;
    }
    var output = {};
    for (var i = 0; i < countriesShuffled.length; ++i) {
      var country = { "Player": countriesShuffled[i].Player, "Armies": countriesShuffled[i].Armies };
      output[countriesShuffled[i].Name] = country;
    }

    // countriesShuffled.sort((a, b) => a.Name > b.Name)
    return output;
  }
}