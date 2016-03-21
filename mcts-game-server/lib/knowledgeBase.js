// an abstraction of neo4j calls
// a wrapper for cypher queries and the request module
'use strict';
{
	module.exports = {
		update,
		parentOf,
		childOf,
		relatedAction
	}
	var request = require('request');

	function update(variant, board, value) {}

	function parentOf(variant, board) {}

	function childOf(variant, board) {}

	function relatedAction(variant, parent, child) {}
	
}