'use strict';
{
	module.exports = {
		serialize,
		deserialize,
		hash,
		constructQueryBody
	}

	var _ = require('lodash')
		, stringHash = require('string-hash')

	function serialize(board) {
		return JSON.stringify(board);
	}

	function deserialize(board) {
		return JSON.parse(board);
	}

	function hash(s) {
		var result;
		try {
			result = stringHash(s);
		} catch (e) {
			throw new Error('[knowledgeBase.helper.hash()]: was unable to hash input of type ' + typeof s + '.')
		}
		return result;
	}

	function constructQueryBody(statements, parameters) {
		if (!Array.isArray(statements) || !Array.isArray(parameters || statements.length != parameters.length)) {
			if (statements && parameters) {
				return {statements:[{statement:statements, parameters: parameters}]};
			} else if (statements) {
				return {statements:[{statement:statements}]};
			} else {
				return {statements: []};
			}
		} else {
			var output = {statements:[]}
			for (var i = 0; i < statements.length; ++i) {
				output.statements.push({statement: statements[i], parameters: parameters[i]});
			}
			return output;
		}
	}
}