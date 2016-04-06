'use strict';
{
	var BoardObject = require('../lib/BoardObject')
		, expect = require('chai').expect;

	describe('BoardObject', function() {
		it('should be new-able but should throw an error without any parameters', function() {
			var result, error;
			try {
				result = new BoardObject()
			} catch (e) {
				error = e;
			}
			expect(result).to.not.exist;
			expect(error).to.exist;
		})
		it('should throw an error when gameNum is not a number', function() {
			var result, error;
			try {
				result = new BoardObject('foo', 'bar', [{type:'baz'}])
			} catch (e) {
				error = e;
			}
			expect(result).to.not.exist;
			expect(error.message).to.contain('gameNum');
		})
		it('should throw an error when gameVariant is not a string', function() {
			var result, error;
			try {
				result = new BoardObject(1, 847, [{type:'baz'}])
			} catch (e) {
				error = e;
			}
			expect(result).to.not.exist;
			expect(error.message).to.contain('gameVariant');
		})
		it('should throw an error when players is not an array', function() {
			var result, error;
			try {
				result = new BoardObject(1, 'bar', {"1": {type: 'baz'}})
			} catch (e) {
				error = e;
			}
			expect(result).to.not.exist;
			expect(error.message).to.contain('players');
		})
		it('should throw an error when a player is missing a type property', function() {
			var result, error;
			try {
				result = new BoardObject(1, 'bar', [{type:'AI'}, {pipe:'HUMAN'}])
			} catch (e) {
				error = e;
			}
			expect(result).to.not.exist;
			expect(error.message).to.contain('missing a type property');
		})	
		it('should throw an error when a player has an invalid type property', function() {
			var result, error;
			try {
				result = new BoardObject(1, 'bar', [{type:'baz'}, {type:'HOOMAN'}])
			} catch (e) {
				error = e;
			}
			expect(result).to.not.exist;
			expect(error.message).to.contain('"AI" or "HUMAN"');
		})
		it('should construct the correct object with simple 2 player game parameters', function() {
			var result, error;
			try {
				result = new BoardObject(2, 'someGameType', [{type:'HUMAN'},{type:'AI'}])
			} catch (e) {
				error = e;
			}
			expect(error).to.not.exist;
			expect(result.gameNumber).to.equal(2)
			expect(result.gameVariant).to.equal('someGameType')
			expect(result.current.turn).to.equal(1)
			expect(result.current.player).to.equal(0)
			expect(result.players[0].type).to.equal('HUMAN')
			expect(result.players[1].type).to.equal('AI')
		})						
	})
}