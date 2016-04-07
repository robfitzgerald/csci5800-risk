'use strict';
{
	var _ = require('lodash')
	module.exports = class BoardObject {
		/**
		 * base class constructor for a board object
		 * @param  {Number} gameNum      - the nth game of this gameVariant
		 * @param  {String} gameVariant  - the name of the gameVariant this board uses
		 * @param  {Object[]} players    - an array of objects with at least one property 'type'
		 * @param  {String} players.type - string stating either a "HUMAN" or "AI" player
		 */
		constructor (gameNum, gameVariant, players) {
			if (!Array.isArray(players)) {
				throw new TypeError('[BoardClass]: players should be an array, got ' + JSON.stringify(players))
			} if (typeof gameNum !== 'number') {
				throw new TypeError('[BoardClass]: gameNum should be a number, got ' + JSON.stringify(gameNum))
			} else if (typeof gameVariant !== 'string') {
				throw new TypeError('[BoardClass]: gameVariant should be a string, got ' + JSON.stringify(gameVariant))
			} else {
				this.gameNumber = gameNum;
				this.gameVariant = gameVariant;
				this.Players = players.length;
				this.Turn = 0;
				this.moveCount = 0;
				this.playerDetails = [];
				var outerScope = this;
				_.forEach(players, function(player) {
					var thisType = _.get(player, 'type');
					if (!thisType) {
						throw new TypeError('[BoardClass]: a player is missing a type property');
					} else if (thisType !== 'AI' && thisType !== 'HUMAN') {
						throw new TypeError('[BoardClass]: this player element was not of the form "AI" or "HUMAN", got ' + JSON.stringify(player))
					} else {
						outerScope.playerDetails.push(player)
					}
				})				
			}
		}
	}
}