'use strict';
{
	var expect = require('chai').expect
		, _ = require('lodash')
		, RiskBoard = require('../gameResources/RiskBoard')
		, BoardObject = require('../lib/BoardObject')

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
		describe('endTurn()', function() {
			it('should move to the next player and update free armies on endTurn()', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, player1CountryCount = Math.floor(_.filter(board.Countries, c => c.Player === 1).length / 3);
				board.endTurn();
				expect(board.Turn).to.equal(1);
				expect(board.Free).to.equal(player1CountryCount);
				expect(board.Phase).to.equal('placement');
			})
		})
		describe('equals()', function() {
			it('should recognize when two RiskBoards are equivalent', function() {
				var board1 = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, board2 = _.clone(board1)

				expect(board1.equals(board2)).to.be.true
				expect(board2.equals(board1)).to.be.true			
			})
			it('should fail when checking equivalency against non-RiskBoard things', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, string = "test"
					, int = 1234
					, object = {}
				expect(board.equals(string)).to.be.false
				expect(board.equals(int)).to.be.false
				expect(board.equals(object)).to.be.false
				expect(board.equals(undefined)).to.be.false
				expect(board.equals(null)).to.be.false
			})
			it('should fail when checking equivalency against BoardObjects which are a subset of RiskBoards', function() {
				var risk = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, board = new BoardObject(1972, 'Risk', [{type:'AI'},{type:'AI'}])
				expect(risk.equals(board)).to.be.false
				expect(board.equals(risk)).to.be.false
			})
		})
		describe('getCountryPlayer()', function() {
			it('should return the correct country player for a player\'s countries', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
      		, thisPlayersCountries = _.filter(
  						_.map(board.Countries, function(v, k) {
  							return {Name: k, Player: v.Player, Armies: v.Armies}
  						})    			
      			, function(country) {
          		return country.Player === board.Turn;
        		})
      	_.forEach(thisPlayersCountries, function(c) {
      		expect(board.getCountryPlayer(c.Name)).to.equal(board.Turn);
      	})
			})
			it('should throw an error if an invalid country name is asked for', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.getCountryPlayer('Atlantis');
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.getCountryPlayer()]: country Atlantis is an invalid country name.');
				}
				expect(result).to.not.exist;
			})
		})
		describe('setCountryPlayer()', function() {
			it('should properly set the player attribute of a country', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result
					, Alberta = board.getCountryPlayer('Alberta')
					, otherPlayer = (Alberta.Player === 0 ? 1 : 0)
				board.setCountryPlayer('Alberta', otherPlayer)
				result = board.getCountryPlayer('Alberta')
				expect(result).to.equal(otherPlayer)				
			})
			it('should throw an error if an invalid country name is asked for', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.setCountryPlayer('Atlantis', 0);
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.setCountryPlayer()]: country Atlantis is an invalid country name.');
				}
				expect(result).to.not.exist;
			})
			it('should throw an error if the player argument is not an integer', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.setCountryPlayer('Alberta', '2');
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.setCountryPlayer()]: arg2 should be an integer Number, but got string 2.');
				}
				expect(result).to.not.exist;				
			})
			it('should throw an error if the player argument is out of range', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.setCountryPlayer('Alberta', 700);
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.setCountryPlayer()]: arg2 needs to be a number between 0 and 1, but was 700.');
				}
				try {
					result = board.setCountryPlayer('Alberta', -1);
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.setCountryPlayer()]: arg2 needs to be a number between 0 and 1, but was -1.');
				}
				expect(result).to.not.exist;	
			})			
		})
		describe('getCountryArmies()', function() {
			it('should return the correct country armies for a player\'s countries', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
      		, thisPlayersCountries = _.filter(
  						_.map(board.Countries, function(v, k) {
  							return {Name: k, Player: v.Player, Armies: v.Armies}
  						})    			
      			, function(country) {
          			return country.Player === board.Turn;
        			})
      	_.forEach(thisPlayersCountries, function(c) {
      		expect(board.getCountryArmies(c.Name)).to.equal(board.Countries[c.Name].Armies);
      	})
			})
			it('should throw an error if an invalid country name is asked for', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.getCountryArmies('Atlantis');
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.getCountryArmies()]: country Atlantis is an invalid country name.');
				}
				expect(result).to.not.exist;
			})
		})
		describe('setCountryArmies()', function() {
			it('should properly set the armies attribute of a country', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result
				board.setCountryArmies('Alberta', 10)
				result = board.getCountryArmies('Alberta')
				expect(result).to.equal(10)				
			})
			it('should throw an error if an invalid country name is asked for', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.setCountryArmies('Atlantis', 0);
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.setCountryArmies()]: country Atlantis is an invalid country name.');
				}
				expect(result).to.not.exist;
			})
			it('should throw an error if the player argument is not an integer', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.setCountryArmies('Alberta', '2');
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.setCountryArmies()]: arg2 should be a Number, but got string.');
				}
				expect(result).to.not.exist;				
			})
			it('should throw an error if the player argument is out of range', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, result;
				try {
					result = board.setCountryArmies('Alberta', -1);
				} catch (e) {
					expect(e.message).to.contain('[RiskBoard.setCountryArmies()]: arg2 needs to be a non-negative integer, but was -1.');
				}
				expect(result).to.not.exist;	
			})			
		})	
		describe('_continentReward()', function() {
			it('should generate a continent reward of 2 when South America is controlled', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, allCountries = Object.keys(board.Countries)
				_.forEach(allCountries, function(cName) {
					board.setCountryPlayer(cName, 1)
				})
				board.setCountryPlayer('Venezuela', 0)
				board.setCountryPlayer('Peru', 0)
				board.setCountryPlayer('Brazil', 0)
				board.setCountryPlayer('Argentina', 0)
				var result = board._continentReward();
				expect(result).to.equal(board.rules.continents.SouthAmerica.bonus);
			})
			it('should generate a continent reward of 0 when no continent is controlled', function() {
				var board = new RiskBoard(1972, 'Risk', [{type:'AI'},{type:'AI'}])
					, allCountries = Object.keys(board.Countries)
				_.forEach(allCountries, function(cName) {
					board.setCountryPlayer(cName, 1)
				})
				var result = board._continentReward();
				expect(result).to.equal(0);
			})
		})
	})

}