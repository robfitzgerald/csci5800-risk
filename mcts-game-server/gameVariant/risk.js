'use strict';
{
	module.exports = {
		maxPlayers,
		generalize,
		deGeneralize,
		play,
		generate
	}

	var RiskBoard = require('../gameResources/RiskBoard')
		, _ = require('lodash')

	/**
	 * returns the maximum number of players for this game
	 * @return {Number} max number of Risk players
	 */
	function maxPlayers () {
		return 6;
	}

	/**
	 * re-assigns the player numbers so that the current player is
	 * player zero and all other players increment from 1. also
	 * strips properties not used by CLIPS.
	 * @param  {RiskBoard} board - current game board
	 * @return {RiskBoard}       - reformatted for CLIPS and neo4j indexing
	 */
	function generalize (board) {
		console.log('risk.generalize() called with')
		console.log(board)
	}

	/**
	 * re-assigns the correct details for this board 
	 * @param  {RiskBoard} board               - CLIPS-formatted RiskBoard object
	 * @param  {Number} currentPlayerNumber    - the current player's actual player number
	 * @param  {Object} decoratingObject       - any properties will be copied into this RiskBoard
	 * @return {RiskBoard}                     - reformatted for play
	 */
	function deGeneralize (board, currentPlayerNumber, decoratingObject) {
		var intersection = _.intersection(_.keys(board), _.keys(decoratingObject));
		if (typeof board !== 'object' || !board.hasOwnProperty('Turn')) {
			// TODO: create a static class member function equivalent to isArray()
			// Javascript instanceof fails when class object is passed from module to module,
			// and each module has its own copy of the class definition, as this is currently set up.
			throw new TypeError('[risk.deGeneralize]: board parameter is not an instance of RiskBoard, is a/an: ' + typeof RiskBoard)
		} else if (typeof currentPlayerNumber !== 'number') {
			throw new TypeError('[risk.deGeneralize]: currentPlayerNumber is not a number, got ' + JSON.stringify(currentPlayerNumber))
		} else if (!_.isObjectLike(decoratingObject)) {
			throw new TypeError('[risk.deGeneralize]: decoratingObject is not object-like; it\'s type is ' + typeof decoratingObject)
		} else if (intersection.length > 0) {
			throw new TypeError('[risk.deGeneralize]: decoratingObject contains properties that will overwrite properties in board: ' + intersection)
		} else {
			var deGeneralizedBoard = _.cloneDeep(board)
				, playerMap = []; // array that acts as a hashing function
			Object.assign(deGeneralizedBoard, decoratingObject)
			playerMap.push(currentPlayerNumber); // index 0 
			for (var i = 1, j = 0; i < deGeneralizedBoard.Players; ++i, ++j) {
				if (i <= currentPlayerNumber) 
					playerMap[i] = j;
				else
					playerMap[i] = i;
			}
			deGeneralizedBoard.Countries.forEach(function(country) {
				country.Player = playerMap[country.Player];
			})
			return deGeneralizedBoard;
		}
	}

	function play (board, action) {
		console.log('risk.play() called with board, action:')
		console.log(board)
		console.log(action)
		console.log('<call to CLIPS to play on this combination of board, action>')
		return 'result of risk.play()'
	}

	/**
	 * instantiates a new basic risk board
	 * @param  {Object[]} players      - array of player objects
	 * @param  {String} players[].type - a player type such as AI, HUMAN
	 * @param  {String} variant        - valid gameVariant filename
	 * @return {RiskBoard}             - new game board
	 */
	function generate (players, variant) {
		var gameNumber = variant.length;  // go to database, increment gameCount, return incremented value
		return new RiskBoard(gameNumber, players)
	}
}