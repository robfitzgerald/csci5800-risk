'use strict';
{

  var BoardObject = require ('../lib/BoardObject')
    , _ = require('lodash')
    , config = require('config')

  /**
   * @property {Object} Country     - object to represent a country
   * @param {String} Country.Name   - name of country
   * @param {Number} Country.Player - enumeration of player owning this country
   * @param {Number} Country.Armies - number of armies on this Country
   */

  /**
   * RiskBoard class for a given board instance floating through the Nodejs code base
   */
  module.exports = class RiskBoard extends BoardObject {
    constructor (gameNum, variant, players) {
      super (gameNum, variant, players);
      this.Phase = 'attack';
      this.Countries = setupCountries(this.Players);
      this.Free = 0;
      this.Steps = config.get('clips.steps');
      this.rules = {};

      /**
       * an object containing continents, their countries and army bonus values
       * @type {Object}
       */
      this.rules.continents = { 
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
      }
    } 

    getCountryPlayer(country) {
      if (!_.get(this.Countries, country)) {
        throw new Error('[RiskBoard.getCountryPlayer()]: country ' + country + ' is an invalid country name.')
      } else {
        return this.Countries[country].Player;
      }
    }

    setCountryPlayer(country, player) {
      if (!_.get(this.Countries, country)) {
        throw new Error('[RiskBoard.setCountryPlayer()]: country ' + country + ' is an invalid country name.')
      } else if (!_.isInteger(player)) {
        throw new Error('[RiskBoard.setCountryPlayer()]: arg2 should be an integer Number, but got ' + typeof player + ' ' + player + '.')
      } else if (player < 0 || player >= this.Players) {
        throw new Error('[RiskBoard.setCountryPlayer()]: arg2 needs to be a number between 0 and ' + (this.Players - 1) + ', but was ' + player + '.')
      }
      this.Countries[country].Player = player;
    }

    getCountryArmies(country) {
      if (!_.get(this.Countries, country)) {
        throw new Error('[RiskBoard.getCountryArmies()]: country ' + country + ' is an invalid country name.')
      } else {
        return this.Countries[country].Armies;
      }
    }

    setCountryArmies(country, armies) {
      if (!_.get(this.Countries, country)) {
        throw new Error('[RiskBoard.setCountryArmies()]: country ' + country + ' is an invalid country name.')
      } else if (!_.isInteger(armies)) {
        throw new Error('[RiskBoard.setCountryArmies()]: arg2 should be a Number, but got ' + typeof armies + '.')
      } else if (armies < 0) {
        throw new Error('[RiskBoard.setCountryArmies()]: arg2 needs to be a non-negative integer, but was ' + armies + '.')
      }
      this.Countries[country].Armies = armies;
    }

    /**
     * ends the game turn for a player and issues new armies to the next player
     * @return {RiskBoard} - returns this for method chaining
     */
    endTurn () {
      this.Turn = ((this.Turn + 1) % this.Players);
      this.Free = Math.floor(_.filter(this.Countries, c => c.Player === this.Turn).length / 3);
      this.Phase = 'placement';
      return this;
    }

    equals(board) {
      return super.equals(board)
    }
    
    _continentReward () {
      var currentTurn = this.Turn
        , continents = this.rules.continents
        , thisPlayersCountries = _.filter(
            _.map(this.Countries, function(v, k) {
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

  }

  /**
   * an array of all valid countries and their respective continents
   * @type {Object[]}
   * @param {String} countries[].Name       - country name
   */      
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
  ];

  /**
   * distributes the countries evenly and evenly populates them with armies
   * @param  {Number} numPlayers - number of players
   * @return {Object[]}          - array of country objects
   */
  function setupCountries(numPlayers) {
    var totalArmiesOnBoard = [null, null, 80, 115, 120, 125, 120][numPlayers]
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
    countriesShuffled.sort((a,b) => a.Name > b.Name)
    var output = {};
    for (var i = 0; i < countriesShuffled.length; ++i) {
      var country = { "Player": countriesShuffled[i].Player, "Armies": countriesShuffled[i].Armies };
      output[countriesShuffled[i].Name] = country;
    }
    return output;
  }
}