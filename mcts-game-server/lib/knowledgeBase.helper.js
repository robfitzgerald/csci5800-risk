'use strict';
{
	module.exports = {
		serialize,
		deserialize,
		serializeAction,
		deserializeAction,
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

	function serializeAction(a) {
		return a.name + ':' + _.join(a.params, ',');
	}

	function deserializeAction(serializedA) {
		var action = {}
			, splitString = _.split(serializedA, ':')
		action.name = splitString[0]
		// _.split() will place an empty string at splitString[1] if there is nothing
		// beyond the :.  if it is not empty, then there must be params.  if not, 
		// !!splitString[1] should be false.
		if (!!splitString[1]) {
			action.params = _.split(splitString[1], ',');
		} else {
			action.params = [];
		}
		return action;
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