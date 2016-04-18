'use strict';
{
	var expect = require('chai').expect
		, _ = require('lodash')
		, Risk = require('../gameVariant/risk')
		, RiskBoard = require('../gameResources/RiskBoard');

	describe('Risk', function() {
		describe('.generate()', function() {
			it('should generate a board', function() {
				var board = Risk.generate('Risk', [{type:'AI'},{type:'HUMAN'}])
				expect(board instanceof RiskBoard).to.equal(true)				
			})
		})
		describe('.generalize()', function() {
			it('should throw an error if some properties are missing', function() {
				var board = {Players:2}
					, result
					, error;
				try {
					result = Risk.generalize(board);
				} catch (e) {
					error = e;
				}
				expect(result).to.not.exist;
				expect(error).to.exist;
				expect(error.message).to.not.contain('Players')
			})
			it('should remap the players ordered from 0,1,2,3 to 2,3,0,1, when currentPlayer is 2', function() {
				var board = Risk.generate('Risk', [{type:'AI'},{type:'HUMAN'},{type:'HUMAN'},{type:'AI'}])
				board.Turn = 2;
				var result = Risk.generalize(board)
				for (var i = 0; i < board.Countries.length; ++i) {
					var before = board.Countries[i].Player 
						,	after = result.Countries[i].Player
					function diffBy2(val) { return (((before + 4) - 2) % 4); } // 4 players, currentPlayer = 2
					expect(after).to.equal(diffBy2(before));
				}
			})
			it('generalizing the same board twice should make equivalent boards', function() {
				var board = Risk.generate('Risk', [{type:'AI'},{type:'HUMAN'},{type:'HUMAN'},{type:'AI'}])
					, generalizedOne = Risk.generalize(board)
					, generalizedTwo = Risk.generalize(board)
				expect(_.isEqual(generalizedOne, generalizedTwo)).to.be.true;
			})
		})
	})
}