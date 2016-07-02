// an abstraction of neo4j calls
// a wrapper for cypher queries and the request module
'use strict';
{
	var request = require('request')
		, config = require('config')
		, debug = require('debug')('mcts:database')
		, auth = new Buffer(config.get('neo4j.username') + ':' + config.get('neo4j.password'))
		, configuredDatabaseController = request.defaults({
			method: 'POST',
			url: config.get('neo4j.baseUrl'),
			headers: {
				Authorization: 'Basic ' + auth.toString('base64')
			}
		})

	module.exports = {
		createNewRoot: require('./core/createNewRoot')(configuredDatabaseController),
		configureDatabase: require('./core/configureDatabase')(configuredDatabaseController),
		getNode: require('./core/getNode')(configuredDatabaseController),
		mergeNode: require('./core/mergeNode')(configuredDatabaseController),
		createChildren: require('./core/CreateChildren')(configuredDatabaseController),
		backup: require('./mcts/backup')(configuredDatabaseController),
		bestChild: require('./mcts/bestChild')(configuredDatabaseController),
		treePolicy: require('./mcts/treePolicy')(configuredDatabaseController)
	}

	debug('database controller loaded')

	/**
	 * JSON representation of neo4j tree objects
	 * @property {Object} TreeNode               - neo4j board state tree node object
	 * @param {Number}    TreeNode.index         - hashed board value
	 * @param {String}    TreeNode.board         - stringified, generalized RiskBoard object
	 * @param {Boolean}   TreeNode.nonTerminal   - is this board a game over state?
	 * @param {Number}    TreeNode.rewards 		   - non-negative value increased by 1 for every winning outcome simulated by nodes in this branch
	 * @param {Number}    TreeNode.visits	       - how many times a simulation has been run on this node or any of its children
	 * @param {Number}    TreeNode.createdAt     - Epoch time date representation when this node was generated
	 */	
}
