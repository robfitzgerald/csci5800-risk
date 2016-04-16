'use strict';
{
	var RiskBoard = require('../gameResources/RiskBoard.js')
		, expect = require('chai').expect

	describe('RiskBoard', function() {
		it('both players lost 1 army when player 0 attacked from Alberta to NorthwestTerritory', function() {
			// setup
			var board = new RiskBoard(0, 'Risk', [{type:'AI'},{type:'AI'}])
			board.setCountryPlayer('Alberta', 0)
			board.setCountryArmies('Alberta', 8)
			board.setCountryPlayer('NorthwestTerritory', 1)
			board.setCountryArmies('NorthwestTerritory', 4)
			
			// example usage
			// it really begs for a function like board.modifyCountryArmies('Alberta', 8, -1)..
			// but this is what you get for now :-|
			var p0Armies = board.getCountryArmies('Alberta')
			board.setCountryArmies('Alberta', p0Armies - 1)
			var p1Armies = board.getCountryArmies('NorthwestTerritory')
			board.setCountryArmies('NorthwestTerritory', p1Armies - 1)

			// test
			expect(board.getCountryArmies('Alberta')).to.equal(7)
			expect(board.getCountryArmies('NorthwestTerritory')).to.equal(3)
		})
		it('should be on p0\'s turn after 4 end turns on a 4-player game, staring from p0', function() {
			// setup
			var fourPlayers = [{type:'AI'},{type:'AI'},{type:'AI'},{type:'AI'}]
				, board = new RiskBoard(0, 'Risk', fourPlayers)

			// example usage / test
			expect(board.Turn).to.equal(0)
			board.endTurn()
			expect(board.Turn).to.equal(1)
			board.endTurn()
			expect(board.Turn).to.equal(2)
			board.endTurn()
			expect(board.Turn).to.equal(3)
			board.endTurn()
			expect(board.Turn).to.equal(0)
		})
		it('player one takes alberta from nw territory with 3 armies', function() {
			// setup
			var board = new RiskBoard(0, 'Risk', [{type:'AI'},{type:'AI'}])
				, p0 = 0
				, p1 = 1
				, attackedWith = 3
			board.setCountryPlayer('Alberta', p0)
			board.setCountryArmies('Alberta', 2)
			board.setCountryPlayer('NorthwestTerritory', p1)
			board.setCountryArmies('NorthwestTerritory', 7)		

			// example usage
			var p0ArmiesAfterAttack = (board.getCountryArmies('Alberta') - 2)
			if (p0ArmiesAfterAttack <= 0) {
				// killed player at country.
				var sourceArmiesRemaining = board.getCountryArmies('NorthwestTerritory') - attackedWith;
				board.setCountryPlayer('Alberta', p1)
				board.setCountryArmies('Alberta', attackedWith)
				board.setCountryArmies('NorthwestTerritory', sourceArmiesRemaining)
			}		

			// test
			expect(board.getCountryPlayer('Alberta')).to.equal(p1)
			expect(board.getCountryPlayer('NorthwestTerritory')).to.equal(p1)
			expect(board.getCountryArmies('Alberta')).to.equal(3)
			expect(board.getCountryArmies('NorthwestTerritory')).to.equal(4)
		})
	})
}