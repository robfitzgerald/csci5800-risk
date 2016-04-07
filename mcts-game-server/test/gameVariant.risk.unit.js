'use strict';
{
	var expect = require('chai').expect
		, Risk = require('../gameVariant/risk')
		, RiskBoard = require('../gameResources/RiskBoard');

	describe('Risk', function() {
		describe('.generate()', function() {
			it('should generate a board', function() {
				var board = Risk.generate([{type:'AI'},{type:'HUMAN'}], 'Risk')
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
		})
		describe('.deGeneralize()', function() {
			it('should throw an error on bad types', function() {
				var badBoard, badPlayerNum, badObject, confictingObject
					, badError, plNError, objError, cfOError
					, board = Risk.generate([{type:'AI'},{type:'HUMAN'}], 'Risk')
				try {
					badBoard = Risk.deGeneralize({type: 'not a board'}, 1, {decorating:'object'})
				} catch (e) {
					badError = e;
				}
				try {
					badPlayerNum = Risk.deGeneralize(board, 'not a number', {decorating:'object'})
				} catch (e) {
					plNError = e;
				}
				try {
					badObject = Risk.deGeneralize(board, 1, 'not object-like')
				} catch (e) {
					objError = e;
				}
				try {
					confictingObject = Risk.deGeneralize(board, 1, {Players: 'Players is a protected attribute'}) 
				} catch (e) {
					cfOError = e;
				}
				expect(badBoard).to.not.exist;
				expect(badPlayerNum).to.not.exist;
				expect(badObject).to.not.exist;
				expect(confictingObject).to.not.exist;
				expect(badError).to.exist;
				expect(plNError).to.exist;
				expect(objError).to.exist;
				expect(cfOError).to.exist;
			})
			it('should remap the players ordered from 0,1,2,3 to 2,0,1,3, and merge in the decoratingObject parameter, when currentPlayer is 2', function() {
				var board = Risk.generate([{type:'AI'},{type:'HUMAN'},{type:'HUMAN'},{type:'AI'}], 'Risk')
					, result = Risk.deGeneralize(board, 2, {test:'merged in property'})
					, mapping = [2, 0, 1, 3]; // this should be the mapping generated in deGeneralize
				for (var i = 0; i < board.Countries.length; ++i) {
					var before = board.Countries[i].Player
						, after = result.Countries[i].Player
					expect(mapping[before]).to.equal(after);
				}
				expect(result.test).to.equal('merged in property')
				expect(board.hasOwnProperty('test')).to.equal(false)
			})
		})
	})
}