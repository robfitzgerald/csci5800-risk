'use strict';
{
	module.exports = {
		maxPlayers,
		generalize,
		deGeneralize,  // TODO: rewrite mapping to cyclical if you want to start using this again.
		play,
		generate,
	}

	var RiskBoard = require('../gameResources/RiskBoard')
		, _ = require('lodash')

	/**
	 * this array contains a list of the properties that should be found
	 * on a board object.
	 * @type {Array}
	 */
	var schema = [
			'Turn', 'Countries', 'Phase', 'Free', 'Steps', 'Players'
			]

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
		var schemaValidate = _.difference(schema, _.keys(board));
		if (schemaValidate.length > 0) {
			throw new TypeError('[risk.generalize]: board did not contain all properties required. missing: ' + schemaValidate)
		} else {
			var generalizedBoard = _.cloneDeep(board)
				, distance = generalizedBoard.Turn
				, numPlayers = generalizedBoard.Players
			_.forEach(generalizedBoard.Countries, function(country) {
				country.Player = (((country.Player + numPlayers) - distance) % numPlayers);
			});
			return _.pick(generalizedBoard, schema);		
		}
	}

	/**
	 * re-assigns the correct details for this board 
	 * @param  {RiskBoard} board               - CLIPS-formatted RiskBoard object
	 * @param  {Number} currentPlayerNumber    - the current player's actual player number
	 * @param  {Object} decoratingObject       - any properties will be copied into this RiskBoard as long as they do not overwrite any properties on board
	 * @deprecated                             - generalization is now a 1-way trip to neo4j and that's all. right?
	 * @return {RiskBoard}                     - reformatted for play
	 */
	function deGeneralize (board, currentPlayerNumber, decoratingObject) {
		var intersection = _.intersection(_.keys(board), _.keys(decoratingObject))
			, schemaValidate = _.difference(schema, _.keys(board));
		if (schemaValidate.length > 0) {
			throw new TypeError('[risk.deGeneralize]: board did not contain all properties required. missing: ' + schemaValidate)
		} else if (typeof currentPlayerNumber !== 'number') {
			throw new TypeError('[risk.deGeneralize]: currentPlayerNumber is not a number, got ' + JSON.stringify(currentPlayerNumber))
		} else if (!_.isObjectLike(decoratingObject)) {
			throw new TypeError('[risk.deGeneralize]: decoratingObject is not object-like; it\'s type is ' + typeof decoratingObject)
		} else if (intersection.length > 0) {
			throw new TypeError('[risk.deGeneralize]: decoratingObject contains properties that will overwrite properties in board: ' + intersection)
		} else {
			var deGeneralizedBoard = _.cloneDeep(board)
				, playerMap = []; // array that acts as a mapping function for player numbers
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
	 * @param  {String} variant        - valid gameVariant filename
	 * @param  {Object[]} players      - array of player objects
	 * @param  {String} players[].type - a player type such as AI, HUMAN
	 * @return {RiskBoard}             - new game board
	 */
	function generate (variant, players) {
		var gameNumber = 0;  // go to database, increment gameCount, return incremented value
		return new RiskBoard(gameNumber, variant, players)
	}
}