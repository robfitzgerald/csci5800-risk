'use strict';
{
	var expect = require('chai').expect
		, _ = require('lodash')
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
				board1 = new RiskBoard(2112, 'Risk', players);
				board2 = new RiskBoard(2113, 'Risk', players);
			} catch (e) {
				error = e;
			}
			expect(error).to.not.exist;	
			var exactlyTheSame = true
				, playerNumberInRange = true
				, keys = _.keys(board1.Countries)
			for (var i = 0; i < keys.length; ++i) {
				if (board1.Countries[keys[i]].Player !== board2.Countries[keys[i]].Player) {
					exactlyTheSame = false;
				}
				if(
					board1.Countries[keys[i]].Player < 0 ||
					board1.Countries[keys[i]].Player >= players.length || 
					board2.Countries[keys[i]].Player < 0 ||
					board2.Countries[keys[i]].Player >= players.length
					) {
					playerNumberInRange = false;
				}
			}
			expect(exactlyTheSame).to.equal(false);
			expect(playerNumberInRange).to.equal(true);
		})
		it('should move to the next player and update free armies on endTurn()', function() {
			var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
				, player1CountryCount = Math.floor(_.filter(board.Countries, c => c.Player === 1).length / 3);
			board.endTurn();
			expect(board.Turn).to.equal(1);
			expect(board.Free).to.equal(player1CountryCount);
			expect(board.Phase).to.equal('placement');
		})
	})

}