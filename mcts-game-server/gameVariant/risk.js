'use strict';
{
	module.exports = {
		serialize,
		deserialize,
		play,
		generate
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