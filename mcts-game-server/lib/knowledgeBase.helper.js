'use strict';
{
	module.exports = {
		serializeBoard,
		deserializeBoard,
		constructQueryBody
	}

	function serializeBoard(board) {
		var output = new Buffer(board)
		return output.toString('base64');
	}

	function deserializeBoard(string) {
		var output = new Buffer(string, 'base64')
		return output.toString('utf8')
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