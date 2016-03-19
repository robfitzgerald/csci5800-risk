'use strict';
{
	module.exports = {
		serialize: serialize,
		deserialize: deserialize,
		play: play
	}

	function serialize (board) {
		console.log('risk.serialize() called with')
		console.log(board)
	}

	function deserialize (board) {
		console.log('risk.deserialize() called with')
		console.log(board)
	}

	function play (board, move) {
		console.log('risk.play() called with board, move:')
		console.log(board)
		console.log(move)
		return 'some result'
	}
}