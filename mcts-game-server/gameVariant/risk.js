'use strict';
{
	module.exports = {
		maxPlayers,
		serialize,
		deserialize,
		play,
		generate
	}

	/**
	 * returns the maximum number of players for this game
	 * @return {Number} max number of Risk players
	 */
	function maxPlayers () {
		return 6;
	}

	function serialize (board) {
		console.log('risk.serialize() called with')
		console.log(board)
	}

	function deserialize (board) {
		console.log('risk.deserialize() called with')
		console.log(board)
	}

	function play (board, action) {
		console.log('risk.play() called with board, action:')
		console.log(board)
		console.log(action)
		return 'some result'
	}

	function generate (players) {
		return 'a board on ' + players + ' players'
	}
}