/**
 * module that provides an interface for any game variant files found in ../gameVariants. 
 *  used for programmatic variant calling in mcts.js
 * this is helpful, because it will package up all possible variants into a factory-type 
 * object on the heap, versus the other programmatic approach 
 * where require() is run for each board request, resulting in many runtime compilations.
 * @example
 * var board = require('board')
 * var risk = board.risk;  // equivalent to "require('../gameVariant/risk')"
 */
'use strict';
{
	var fs = require('fs')
		, path = require('path')
		, _ = require('lodash')
		, debug = require('debug')('mcts:lib:boards`')

	var directory = path.dirname(__dirname) + '/gameVariant'
		, boards = {};
	
	boards.hasVariant = function(variantName) {
		return _.has(boards, variantName);
	}

	var gameVariantFiles = fs.readdirSync(directory)
	gameVariantFiles.forEach(function(foundVariant) {
		let name = path.parse(foundVariant).name;
		let fn = require('../gameVariant/' + name);
		_.set(boards, name, fn);
	})
	module.exports = boards;	
}