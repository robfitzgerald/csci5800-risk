'use strict';
{

	module.exports = {
		loop,
		innerMcts
	}

	var treePolicy = require('./knowledgeBase').treePolicy
		, defaultPolicy = require('clips-module').simulate
		, mergeNode = require('./knowledgeBase').mergeNode
		, backup = require('./knowledgeBase').backup
		, bestChild = require('./knowledgeBase').bestChild
		, Q = require('q')
		, async = require('async')
		, _ = require('lodash')

	/**
	 * asynchronous while loop of mcts. runs mcts function until computational budget is reached.
	 * @param  {RiskBoard} board            - variant.generalized board object
	 * @param  {Object} variant             - variant. unused?
	 * @param  {Number} computationalBudget - time in ms. to run computation
	 * @return {Promise}                    - resolves and rejects with info string
	 */
	function loop(board, variant, computationalBudget) {
		console.log('mcts.loop: computationalBudget=' + computationalBudget)

		var deferred = Q.defer()
			, stopTime = Number.parseInt(Date.now()) + computationalBudget
			, mctsIterations = 0;
		async.doWhilst(function(callback) {

			// MCTS here.
			// member functions on variant exist to perform operations on a board
			// such as variant.countries, variant.current, or whatever
			// and the various steps in mcts are included as modules:
			// treePolicy, defaultPolicy, backup, bestChild
			// 
			// @TODO: make it so!
			
			innerMcts(board, variant)
				.then(function(result) {
					console.log('completed innerMcts loop. occurence # ' + mctsIterations + '.')
					++mctsIterations;
					callback(null, result);
				})
				.catch(function(error) {
					callback(error)
				})
		},
		function whileTest() {
			return (Date.now() < stopTime);
		},
		function result(error, result) {
			if (error) {
				deferred.reject('[mcts.loop]: error at iteration ' + mctsIterations + ': ' + JSON.stringify(error))
			} else {
				bestChild(result, 0)
					.then(function(tuple) {
						deferred.resolve(tuple);
					})
					.catch(function(bestChildError) {
						deferred.reject('[mcts.loop]: failed bestChild in loop result section. ' + JSON.stringify(bestChildError))
					})
			}
		});
		return deferred.promise;	
	}

	/**
	 * Monte Carlo Tree Search, as described in the Browne et.al. paper
	 * @param  {Object} root               - variant.generalized game board JSON object, root of this search
	 * @param  {Object} variant            - ?singleton object with game-specific function implementation (unused?)
	 * @return {Promise}             			 - a best child, or, error
	 */
	function innerMcts (root, variant) {
		var deferred = Q.defer()

		// console.log('starting innerMcts loop with root, variant:')
		// console.log(root)
		// console.log(variant)

		mergeNode(root)
			.then(function(v0) {
				treePolicy(v0, variant)
					.then(function(generalizedBoard) {
						defaultPolicy(generalizedBoard)
							.then(function(reward) {
								backup(generalizedBoard, _.get(v0, 'index'), reward)
									.then(function(finished) {
										deferred.resolve(v0);
									})
									.catch(function(backupErr) {
										deferred.reject(new Error(JSON.stringify(backupErr)))
									})
							})
							.catch(function(defaultPolicyErr) {
								deferred.reject(new Error (JSON.stringify(defaultPolicyErr)));
							})
					})
					.catch(function(err) {
						deferred.reject(JSON.stringify(err))
					})
			})
			.catch(function(mergeNodeError) {
				deferred.reject(mergeNodeError)
			})
		return deferred.promise;
	}
}