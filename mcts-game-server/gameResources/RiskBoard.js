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
      this.Phase = 'start';
      this.Countries = assignCountries(this.Players);
      this.Steps = config.get('clips.steps');
      this.rules = {};
      var armiesForPlayers = _.nth([null, null, 40, 35, 30, 25, 20], this.Players);
      _.forEach(this.playerDetails, function(player) {
        player.freeArmies = armiesForPlayers;
        player.subVariant = 'not implemented';
      })

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

    /**
     * get the enumerated player number for a given country
     * @param  {String} country - country name
     * @return {Number}         - player number
     */
    getCountryPlayer(country) {
      if (!_.get(this.Countries, country)) {
        throw new Error('[RiskBoard.getCountryPlayer()]: country ' + country + ' is an invalid country name.')
      } else {
        return this.Countries[country].Player;
      }
    }

    /**
     * sets the enumerated player number for a given country
     * @param {String} country - country name
     * @param {Number} player  - player number
     */
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

    /**
     * get the number of armies on a given country
     * @param  {String} country - country name
     * @return {Number}         - army count
     */
    getCountryArmies(country) {
      if (!_.get(this.Countries, country)) {
        throw new Error('[RiskBoard.getCountryArmies()]: country ' + country + ' is an invalid country name.')
      } else {
        return this.Countries[country].Armies;
      }
    }

    /**
     * set the number of armies on a given country
     * @param {String} country - country name
     * @param {Number} armies  - new army count
     */
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
     * modify the number of armies on a given country += the value passed in
     * @param  {String} country - country name
     * @param  {Number} armies  - army count magnitude
     * @return {Number}         - new army count at country
     */
    modifyCountryArmies(country, armies) {
      if (!_.get(this.Countries, country)) {
        throw new Error('[RiskBoard.modifyCountryArmies()]: country ' + country + ' is an invalid country name.')
      } else if (!_.isInteger(armies)) {
        throw new Error('[RiskBoard.modifyCountryArmies()]: arg2 should be a Number, but got ' + typeof armies + '.')
      }
      return this.Countries[country].Armies += armies;
    }

    /**
     * ends the game turn for a player and issues new armies to the next player
     * @return {RiskBoard} - returns this for method chaining
     */
    endTurn () {
      this.Turn = ((this.Turn + 1) % this.Players);
      this.playerDetails[this.Turn].freeArmies = this._countriesReward() + this._continentReward();
      this.Phase = 'placement';
      this.moveCount++;
      return this;
    }

    /**
     * test equality between two RiskBoard objects
     * @param  {RiskBoard} board - a RiskBoard object
     * @return {Boolean}         - equality
     */
    equals(board) {
      return super.equals(board)
    }
    
    /**
     * evaluates the number of new armies to award based on continent ownership
     * @private
     * @return {Number}  - armies rewarded from continent ownership
     */
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

    /**
     * evaluates the number of new armies to award based on country ownership
     * @private
     * @return {Number}  - armies rewarded by calculating # of countries divided by 3
     */
    _countriesReward () {
      return Math.floor(_.filter(this.Countries, c => c.Player === this.Turn).length / 3)
    }

    /**
     * returns true when the game is over
     * @return {Boolean} game over?
     */
    gameOver() {
      var remainingPlayers = _.uniq(
        _.map(
          this.Countries, 
          function(c) { return c.Player; }));
      return remainingPlayers.length === 1;
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
   * assigns countries to players in the same order every time. doesn't place armies.
   * @param  {Number} numPlayers - number of players
   * @return {Object[]}          - array of country objects
   */
  function assignCountries(numPlayers) {
    let stepPlayer = 0
      , thisCountries = _.cloneDeep(countries)
    // it is important that is order is the same every time.
    _.forEach(thisCountries, function(country) {
      country.Player = stepPlayer;
      country.Armies = 1;
      stepPlayer = ((stepPlayer + 1) % numPlayers)     
    })
    var output = {};
    for (var i = 0; i < thisCountries.length; ++i) {
      var country = { "Player": thisCountries[i].Player, "Armies": thisCountries[i].Armies };
      output[thisCountries[i].Name] = country;
    }
    return output;
  }

  /**
   * distributes the countries evenly and evenly populates them with armies
   * @param  {Number} numPlayers - number of players
   * @deprecated                 - we are starting with the same countries each time, and without armies placed
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