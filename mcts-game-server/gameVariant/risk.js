'use strict';
{
	module.exports = {
		maxPlayers,
		generalize,
		play,
		generate,
	}

	var RiskBoard = require('../gameResources/RiskBoard')
		, _ = require('lodash')


	/**
	 * this array contains a list of the properties that should be found
	 * on a board object, for input validation of generalize();
	 * @property {String[]} outSchema  - list of properties of a generalized board
	 */
	var inSchema = [
			'Turn', 'Countries', 'Phase', 'Steps', 'Players'
			]

	/**
	 * we add a new property after generalize. this is used by _.pick().
	 * @property {String[]} outSchema  - list of properties of a generalized board
	 */
	var outSchema = [
			'Turn', 'Countries', 'Phase', 'Steps', 'Players', 'PlayerArmies'
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
		var schemaValidate = _.difference(inSchema, _.keys(board));
		if (schemaValidate.length > 0) {
			throw new TypeError('[risk.generalize]: board did not contain all properties required. missing: ' + schemaValidate)
		} else {
			var generalizedBoard = _.cloneDeep(board)
				, distance = generalizedBoard.Turn
				, numPlayers = generalizedBoard.Players
			generalizedBoard.PlayerArmies = [];
			_.forEach(generalizedBoard.Countries, function(country) {
				country.Player = (((country.Player + numPlayers) - distance) % numPlayers);
			});
			_.forEach(generalizedBoard.playerDetails, function(player) {
				generalizedBoard.PlayerArmies.push(player.freeArmies);
			})

			return _.pick(generalizedBoard, outSchema);		
		}
	}

	function play (board, action) {
		// Create a duplicate of the board
		var result = _.cloneDeep(board);

		switch (action.name) {
			case "placearmy":		// Places a single army at the target country
				// Increment the target country's armies
				result.modifyCountryArmies(action.params[0], 1);

				// Decrement the players available armies
				result.playerDetails[board.Turn].freeArmies = board.playerDetails[board.Turn].freeArmies - 1;

				// Check if the player is out of armies
				if (result.playerDetails[board.Turn].freeArmies == 0) {
					result.Phase = "attack";
				}

				break;
			case "startplace":		// Places a single army at the target country and changes to the next players turn
				break;
			case "attackall":		// Attacks from country 1 to country 2 with all available armies
				// Roll
				// Attacker rolls 1, 2, or 3 dice, depending on the number of attacking armies available
				var attackerDice, defenderDice;

				if(board.Countries[action.params[0]].Armies > 2){
					attackerDice = [0, 0, 0];
				}else if (board.Countries[action.params[0]].Armies == 2) {
					attackerDice = [0, 0];
				}else if (board.Countries[action.params[0]].Armies == 1) {
					attackerDice = [0];
				}else {
					console.log('not enough armies for attack');
					break;
				}
				// Defender rolls 2 dice or 1, depending on the number of defending armies available
				if(board.Countries[action.params[1]].Armies > 1) {
					defenderDice = [0, 0];
				}else {
					defenderDice = [0];
				}

				for (var ad=0; ad<attackerDice.length; ad++) {
					attackerDice[ad] = Math.round(Math.random()*6);
				}
				attackerDice.sort();


				for (var dd=0; dd<defenderDice.length; dd++) {
					defenderDice[dd] = Math.round(Math.random()*6);
				}
				defenderDice.sort();

				// Compare first opposing pair of dice, then remove both
				if(Math.max(attackerDice) > Math.max(defenderDice)) {
					// Decrement an army from defender
					result.modifyCountryArmies(action.params[1], -1);
					attackerDice.pop();
					defenderDice.pop();
				} else if(Math.max(attackerDice) <= Math.max(defenderDice)) {
					// Decrement an army from attacker
					result.modifyCountryArmies(action.params[0], -1);
					attackerDice.pop();
					defenderDice.pop();
				}

				// Compare second opposing pair of dice
				if(Math.max(attackerDice) > Math.max(defenderDice)) {
					// Decrement an army from defender
					result.modifyCountryArmies(action.params[1], -1);
				} else if(Math.max(attackerDice) <= Math.max(defenderDice)) {
					// Decrement an army from attacker
					result.modifyCountryArmies(action.params[0], -1);
				}
				//result.Phase = "fortify";
				break;
			case "attackhalf":		// Attacks from country 1 to country 2 with half available armies
// Roll
				// Attacker rolls 1, 2, or 3 dice, depending on the number of attacking armies available
				var attackerDice, defenderDice;

				if(board.Countries[action.params[0]].Armies > 2){
					attackerDice = [0, 0, 0];
				}else if (board.Countries[action.params[0]].Armies == 2) {
					attackerDice = [0, 0];
				}else if (board.Countries[action.params[0]].Armies == 1) {
					attackerDice = [0];
				}else {
					console.log('not enough armies for attack');
					break;
				}
				// Defender rolls 2 dice or 1, depending on the number of defending armies available
				if(board.Countries[action.params[1]].Armies > 1) {
					defenderDice = [0, 0];
				}else {
					defenderDice = [0];
				}

				for (var ad=0; ad<attackerDice.length; ad++) {
					attackerDice[d] = Math.round(Math.random()*6);
				}
				attackerDice.sort();


				for (var dd=0; dd<defenderDice.length; dd++) {
					defenderDice[dd] = Math.round(Math.random()*6);
				}
				defenderDice.sort();

				// Compare first opposing pair of dice, then remove both
				if(Math.max(attackerDice) > Math.max(defenderDice)) {
					// Decrement an army from defender
					result.modifyCountryArmies(action.params[1], -1);
					attackerDice.pop();
					defenderDice.pop();
				} else if(Math.max(attackerDice) <= Math.max(defenderDice)) {
					// Decrement an army from attacker
					result.modifyCountryArmies(action.params[0], -1);
					attackerDice.pop();
					defenderDice.pop();
				}

				// Compare second opposing pair of dice
				if(Math.max(attackerDice) > Math.max(defenderDice)) {
					// Decrement an army from defender
					result.modifyCountryArmies(action.params[1], -1);
				} else if(Math.max(attackerDice) <= Math.max(defenderDice)) {
					// Decrement an army from attacker
					result.modifyCountryArmies(action.params[0], -1);
				}
			//result.Phase = "fortify";
				break;
			case "fortify":		// Moves all armies except 1 from country a to country b
				result.modifyCountryArmies(action.params[1], board.Countries[action.params[0]].Armies - 1);
				result.modifyCountryArmies(action.params[0], (board.Countries[action.params[0]].Armies - 1) * -1);
				result.Phase = "endturn";
				break;
			case "endturn":
				result.endTurn();
				break;
			default:
				console.log("Ya done broke sum'em");
				console.log("Action does not exist: " + action.name);
				break;
		}

		return result;
	}

	/**
	 * instantiates a new basic risk board. more accurate
	 * @param  {String} variant        - valid gameVariant filename
	 * @param  {Object[]} players      - array of player objects
	 * @param  {String} players[].type - a player type such as AI, HUMAN
	 * @return {RiskBoard}             - new game board
	 */
	function generate (variant, players) {
		var gameNumber = 0;  // go to database, increment gameCount, return incremented value
		return new RiskBoard(gameNumber, variant, players)
	}

	function rootNode() {
		return { 
			index: 4242402646,
  		createdAt: 1461002660279,
		  rewards: 3,
		  nonTerminal: true,
		  board: '{"Turn":0,"Countries":{"Alaska":{"Player":0,"Armies":1},"NorthwestTerritory":{"Player":1,"Armies":1},"Greenland":{"Player":0,"Armies":1},"Alberta":{"Player":1,"Armies":1},"Ontario":{"Player":0,"Armies":1},"WesternUnitedStates":{"Player":1,"Armies":1},"EasternUnitedStates":{"Player":0,"Armies":1},"CentralAmerica":{"Player":1,"Armies":1},"Venezuela":{"Player":0,"Armies":1},"Peru":{"Player":1,"Armies":1},"Brazil":{"Player":0,"Armies":1},"Argentina":{"Player":1,"Armies":1}},"Phase":"start","Free":40,"Steps":1000,"Players":2}',
		  visits: 7 
		};
	}

}