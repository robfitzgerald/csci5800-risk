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

		describe('.expand()', function () {
			it('should return an array', function (done) {
				var board = Risk.generate('Risk', [{type:'AI'},{type:'HUMAN'}]);
				board = Risk.generalize(board);

				var action = {
					name: 'placearmy',
					params: ["Alaska"]
				};

				Risk.expand(board, action).then(function (value) {
					expect(Array.isArray(value)).to.be.true;
					done();
				});
			})

			it('should create a single entry from \'placearmy\'', function (done) {
				var board = Risk.generate('Risk', [{type:'AI'},{type:'HUMAN'}]);
				board = Risk.generalize(board);
				var action = {
					name: 'placearmy',
					params: ["Alaska"]
				};

				Risk.expand(board, action).then(function (value) {
					expect(value.length === 1).to.be.true;
					done();
				});
			})
		})

		describe('.play()', function () {
			it('should return a board for \'placearmy\'', function () {
				var board = Risk.generate('Risk', [{type:'AI'},{type:'HUMAN'}]);

				var totalFreeArmies = board.playerDetails[0].freeArmies;
				var alaskaArmies = board.getCountryArmies("Alaska");

				var action = {
					name: 'placearmy',
					params: ["Alaska"]
				};

				var result = Risk.play(board, action);

				expect((totalFreeArmies - 1) === result.playerDetails[0].freeArmies).to.be.true;
				expect(result.getCountryArmies("Alaska") === (alaskaArmies+1)).to.be.true;
			})
			it('should return a board for \'attackall\'', function () {
				var board = Risk.generate('Risk', [{type:'AI'}, {type:'HUMAN'}]);
				var action = {
					name: 'attackall',
					params: ["Alaska", "NorthwestTerritory"]
				};

				board.setCountryArmies("Alaska", 10);
				board.setCountryArmies("NorthwestTerritory", 10);


				var alaskaArmies = board.getCountryArmies("Alaska");
				var northwestTerritoryArmies = board.getCountryArmies("NorthwestTerritory");

				var result = Risk.play(board, action);

				expect((result.getCountryArmies("Alaska") == alaskaArmies-2 && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies) ||
					(result.getCountryArmies("Alaska") == alaskaArmies-1 && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies) ||
					(result.getCountryArmies("Alaska") == alaskaArmies-1 && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies-1) ||
					(result.getCountryArmies("Alaska") == alaskaArmies && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies-1) ||
					(result.getCountryArmies("Alaska") == alaskaArmies && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies-2)).to.be.true;
			})
			it('should return a board for \'attackhalf\'', function () {
				var board = Risk.generate('Risk', [{type:'AI'}, {type:'HUMAN'}]);
				var action = {
					name: 'attackhalf',
					params: ["Alaska", "NorthwestTerritory"]
				};

				board.setCountryArmies("Alaska", 10);
				board.setCountryArmies("NorthwestTerritory", 10);

				var alaskaArmies = board.getCountryArmies("Alaska");
				var northwestTerritoryArmies = board.getCountryArmies("NorthwestTerritory");

				var result = Risk.play(board, action);

				expect((result.getCountryArmies("Alaska") == alaskaArmies-2 && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies) ||
					(result.getCountryArmies("Alaska") == alaskaArmies-1 && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies) ||
					(result.getCountryArmies("Alaska") == alaskaArmies-1 && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies-1) ||
					(result.getCountryArmies("Alaska") == alaskaArmies && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies-1) ||
					(result.getCountryArmies("Alaska") == alaskaArmies && result.getCountryArmies("NorthwestTerritory") == northwestTerritoryArmies-2)).to.be.true;
			})
			it('should return a board for \'fortify\'', function () {
				var board = Risk.generate('Risk', [{type:'AI'}, {type:'HUMAN'}]);
				var action = {
					name: 'fortify',
					params: ["Alaska", "NorthwestTerritory"]
				};

				board.setCountryArmies("Alaska", 10);
				board.setCountryArmies("NorthwestTerritory", 10);

				var alaskaArmies = board.getCountryArmies("Alaska");
				var northwestTerritoryArmies = board.getCountryArmies("NorthwestTerritory");

				var result = Risk.play(board, action);

				expect((result.getCountryArmies("Alaska") == 1) &&
					(result.getCountryArmies("NorthwestTerritory") == (alaskaArmies - 1 + northwestTerritoryArmies))).to.be.true;
			})
		})
	})
}