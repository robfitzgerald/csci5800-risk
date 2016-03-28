'use strict';
{
	module.exports = {
		serializeBoard,
		deserializeBoard,
		constructQueryBody,
		generateTestChildren,
		generateChild
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

	function generateTestChildren(number, parent) {
		for (var i = 0; i < number; ++i) {
			generateChild(i, parent);
		}
	}

	function generateChild(i, parent) {
		var testChild = {
			nonTerminal: true,
			state: serializeBoard('' + i + i + i + i + i),
			possibleMoves: ['some', 'posible', 'moves'],
			rewards: [(i % 2)],
			visits: 1,
			usedInGame: [],	
		}
		for (var j = 0; j < i; ++j) {
			testChild.rewards.push((j % 2))
			testChild.visits++;
		}
		var allRewards = testChild.rewards.reduce(function(acc, val) { return acc + val })
			, Xbar = allRewards / testChild.visits;
		testChild.uct = Xbar;

		createChild(parent, {move: 'test'}, testChild)
			.then(function(res) {
				console.log(i + 'th child has state ' + testChild.state)
				console.log(JSON.stringify(res));
			});
	}

}