'use strict';
{

	let Q = require('Q')
		, _ = require('lodash')
		, async = require('async')
		, config = require('config')
		, debug = require('debug')('mcts:database:mcts:treePolicy')
	var explorationParameter = config.get('mcts.explorationParameter')
		, helper = require('../database.helper')
	/**
	 * treePolicy method as described in Monte Carlo Tree Search. searches for a best child board state to pass to our defaultPolicy for simulation.
	 * @param  {Object}  root           - tree node for the root of this treePolicy search
	 * @param {Object}   variant        - game variant
	 * @param {Function} variant.expand - returns the list of possible child board states and their possible moves
	 * @return {Promise}                - resolves to a board state object, rejects with any error messages.
	 */
	module.exports = function(neo4j) {
		// including these directly without going through the database controller because i
		// don't know whether that might create some kind of circular reference with treePolicy
		var createChildren = require('../core/createChildren')(neo4j)
		, bestChild = require('./bestChild')(neo4j)
		return function treePolicy(root, variant) {
			if (!_.has(variant, 'expand')) {
				throw new Error('[treePolicy]: variant (arg2) is missing an expand() function');
			}
			debug('entering treePolicy')
			var deferred = Q.defer() ,
				v = root,
				expandableMoveNotFound = true;
			async.doWhilst(function(callback) {
				debug('top of doWhilst loop for index ' + v.index)
				var query = `
					MATCH(b:BOARD {index: ${v.index}}) - [r:POSSIBLE] - > ()
					WITH r, count(*) as possibleMoveCount
					RETURN
					CASE possibleMoveCount > 0
					WHEN true
					THEN r
					WHEN false
					THEN false
					END AS expand`,
				payload = helper.constructQueryBody(query);
				neo4j({json: payload}, function(err, _res, body) {
					var neo4jError = _.get(body, 'errors')
						,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('treePolicy', body) : null);
					if (errors) {
						callback(errors);
					} else {
						debug('in doWhilst, completed neo4j call to get possibleMoves|false:')
						// grab first move. order guaranteed? not guaranteed? probs not.
						var move = _.get(body, 'results[0].data[0].row[0]');
						debug(move)
						if (move) {
							expandableMoveNotFound = false;  // end async.whilst() loop
							var parentBoardToExpand = JSON.parse(v.board);
							debug('found a move.  calling expand above move on parentBoard, move:')
							debug(parentBoardToExpand)
							debug(move)
							parentBoardToExpand.Steps = config.get('clips.Steps')  // required by clips.expand()
							variant.expand(parentBoardToExpand, move)
								.then(function(children) {
									// TODO: remove Steps from the contract on generalizedBoards - steps should not be part of
									// what is used to generate indices in the graph
									_.forEach(children, function(child) {
										_.unset(child, 'board.Steps');
									})
									debug('expand result')
									debug(JSON.stringify(children))
									debug('returned from expand(), calling createChildren()')
									createChildren(v, move, children)
										.then(function(result) {
											// @TODO: confirm that we are always grabbing the result from createChildren.
											// the neo4j response structure is always an array due to collect(c);
											// but is it ever multiple arrays in multiple rows due to possible multiplicity
											// of children generated?
											debug('returned from createChildren(). createChildren result, new v:')
											debug(result)										
											v = _.head(_.head(result));
											debug(v)
											if (!v) {
												let len = _.get(children, 'length');
												throw new Error('created children from ' + len + ' children but _.head() of result from createChildren() is falsey:\n' + JSON.stringify(v));
											}
											callback(null); // doWhilst(): end this iteration
										})
										.catch(function(createError) {
											callback(createError);
										});
								});
						} else {
							debug('didn\'t find a move. calling bestChild() with v, Cp:')
							debug(v)
							debug(explorationParameter)
							bestChild(v, explorationParameter)
								.then(function(vBestChild) {
									debug('returned from bestChild(). setting new "v" to:')
									v = vBestChild.board;
									debug(v)
									if (v) {
										callback(null);
									} else {
										callback(new Error('could not look up board state string of bestChild() with v: ' + JSON.stringify(v) + ' from bestChild result: \n ' + JSON.stringify(vBestChild)));
									}
								})
								.catch(function(bestChildError) {
									callback(bestChildError);
								});
							// copied from bestChild() above (before refactoring to not set c.uct)
						}
					}
				});
			},
			function whileTest() {
				let stillLooking = (expandableMoveNotFound && v.nonTerminal);
				debug('whiteTest of doWhilst loop for index ' + v.index)
				debug('whileTest is ' + stillLooking)
				return stillLooking;
			},
			function result(error, result) {
				if (error) {
					deferred.reject(error);
				} else {
					let output = helper.deserialize(v.board);
					debug('done. treePolicy board result:')
					debug(output)
					deferred.resolve(output);
				}
			});
	  	return deferred.promise;
		}
	}
}