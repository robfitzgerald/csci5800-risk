'use strict';
{
	var _ = require('lodash')
		, expect = require('chai').expect
		, helper = require('../lib/knowledgeBase.helper')
		, variant = require('../gameVariant/risk')


	describe('end-to-end: unique neo4j indices', function() {
		it('hash(serialize(generalize(board))) should be idempotent on multiple calls', function() {
			var board = variant.generate('Risk', [{type:'AI'},{type:'HUMAN'}])
				, generalized = variant.generalize(board)
				, serialized = helper.serialize(generalized)
				, hashedOne = helper.hash(serialized)
				, hashedTwo = helper.hash(serialized)
				, serializedTwo = helper.serialize(generalized)
				, hashedThree = helper.hash(serializedTwo)
				, hashedFour = helper.hash(serializedTwo)
				, generalizedTwo = variant.generalize(board)
				, serializedThree = helper.serialize(generalizedTwo)
				, hashedFive = helper.hash(serializedThree)
				, hashedSix = helper.hash(serializedThree)
			expect(_.isEqual(hashedOne, hashedTwo)).to.be.true;	
			expect(_.isEqual(hashedOne, hashedThree)).to.be.true;	
			expect(_.isEqual(hashedOne, hashedFour)).to.be.true;	
			expect(_.isEqual(hashedOne, hashedFive)).to.be.true;	
			expect(_.isEqual(hashedOne, hashedSix)).to.be.true;	
		})
		it('should still be idempotent when using multiple variant.generate() calls', function() {
			var boardOne = variant.generate('Risk', [{type:'AI'},{type:'HUMAN'}])
				, boardTwo = variant.generate('Risk', [{type:'AI'},{type:'HUMAN'}])
				, hashOne = helper.hash(helper.serialize(variant.generalize(boardOne))) 
				, hashTwo = helper.hash(helper.serialize(variant.generalize(boardTwo))) 
			expect(_.isEqual(hashOne, hashTwo)).to.be.true;
		})
	})
}