'use strict';
{
	var expect = require('chai').expect
		, RiskBoard = require('../gameResources/RiskBoard');

	describe('RiskBoard', function() {
		it('should puke just like it\'s superclass with no params', function() {
			var result, error;
			try {
				result = new RiskBoard();
			} catch(e) {
				error = e;
			}
			expect(error).to.exist;
			expect(result).to.not.exist;
		})
		it('given 2 players, it should randomize country ownership differently on repeated new RiskBoards', function() {
			var board1
				, board2
				, error
				, players = [{type:'AI'},{type:'HUMAN'}]
			try {
				board1 = new RiskBoard(2112, players);
				board2 = new RiskBoard(2113, players);
			} catch (e) {
				error = e;
			}
			expect(error).to.not.exist;	
			var exactlyTheSame = true
				, playerNumberInRange = true;
			for (var i = 0; i < board1.Countries.length; ++i) {
				if (board1.Countries[i].Player !== board2.Countries[i].Player) {
					exactlyTheSame = false;
				}
				if(
					board1.Countries[i].Player < 0 ||
					board1.Countries[i].Player >= players.length || 
					board2.Countries[i].Player < 0 ||
					board2.Countries[i].Player >= players.length
					) {
					playerNumberInRange = false;
				}
			}
			expect(exactlyTheSame).to.equal(false);
			expect(playerNumberInRange).to.equal(true);
		})
		it('should move to the next player and update free armies on endTurn()', function() {
			var board = new RiskBoard(1972, [{type:'AI'},{type:'AI'}])
				, player1CountryCount = board.Countries.filter(c => c.Player === 1).length;
			board.endTurn();
			expect(board.Turn).to.equal(1);
			expect(board.Free).to.equal(player1CountryCount);
			expect(board.Phase).to.equal('placement');
		})
	})

}