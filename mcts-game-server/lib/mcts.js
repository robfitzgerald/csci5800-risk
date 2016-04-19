'use strict';
{

	module.exports = {
		mcts,
		innerMcts
	}

	var treePolicy = require('./knowledgeBase').treePolicy
		, defaultPolicy = require('./clipsController').defaultPolicy
		, createRootNode = require('./knowledgeBase').mergeNode
		, backup = require('./knowledgeBase').backup
		, Q = require('q')
		, async = require('async')

	/**
	 * asynchronous while loop of mcts. runs mcts function until computational budget is reached.
	 * @param  {RiskBoard} board            - variant.generalized board object
	 * @param  {Object} variant             - variant. unused?
	 * @param  {Number} computationalBudget - time in ms. to run computation
	 * @return {Promise}                    - resolves and rejects with info string
	 */
	function mcts(board, variant, computationalBudget) {
		var deferred = Q.defer()
			, stopTime = Date.now() + computationalBudget
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
					// console.log(result)
					++mctsIterations;
					callback(null);
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
				deferred.reject('[mcts]: ' + JSON.stringify(error))
			} else {
				deferred.resolve('[mcts]: success. ran ' + mctsIterations + ' times.')
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
			, rootIndex = 3895442334; // @todo: put in variant.rootIndex() 

		createRootNode(root)
			.then(function(v0) {
				treePolicy(v0)
					.then(function(generalizedBoard) {
						defaultPolicy(generalizedBoard)
							.then(function(reward) {
								backup(generalizedBoard, rootIndex, reward)
									.then(function(finished) {
										var tuple = {
											selected: generalizedBoard,
											reward: reward
										}
										deferred.resolve(tuple);
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
			.catch(function(createRootNodeErr) {
				deferred.reject(createRootNodeErr)
			})
		return deferred.promise;
	}
}