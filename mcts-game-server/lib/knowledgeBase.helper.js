'use strict';
{
	module.exports = {
		serialize,
		deserialize,
		constructQueryBody
	}

	var _ = require('lodash')

	function serialize(board) {
		// var output = new Buffer(JSON.stringify(board))
		// return output.toString('base64');
		return JSON.stringify(board)
	}

	function deserialize(board) {
		// var output = new Buffer(board, 'base64')
		// return output.toString('utf8')
		return JSON.parse(board)
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