'use strict';
{

	module.exports = {
		loop,
		innerMcts
	}

	let Q = require('q')
		, async = require('async')
		, _ = require('lodash')
		, debugOuter = require('debug')('mcts:lib:mcts:outer')
		, debugInner = require('debug')('mcts:lib:mcts:inner')
	var db = require('../database')
		, treePolicy = db.treePolicy
		, defaultPolicy = require('clips-module').simulate
		, mergeNode = db.mergeNode
		, backup = db.backup
		, bestChild = db.bestChild
		, config = require('config')
	/**
	 * asynchronous while loop of mcts. runs mcts function until computational budget is reached.
	 * @param  {RiskBoard} board            - variant.generalized board object
	 * @param  {Object} variant             - variant. unused?
	 * @param  {Number} computationalBudget - time in ms. to run computation
	 * @return {Promise}                    - resolves and rejects with info string
	 */
	function loop(board, variant, computationalBudget) {
		debugOuter('beginning with computationalBudget=' + computationalBudget)

		let deferred = Q.defer()
			, stopTime = Number.parseInt(Date.now()) + computationalBudget
			, mctsIterations = 0
			, rootBoard = variant.rootNodeData().board;
		var debugInnerLoopStart;
		async.doWhilst(function(callback) {

			// MCTS here.
			// member functions on variant exist to perform operations on a board
			// such as variant.countries, variant.current, or whatever
			// and the various steps in mcts are included as modules:
			// treePolicy, defaultPolicy, backup, bestChild
			// 
			// @TODO: make it so!
			debugInnerLoopStart = Date.now();
			innerMcts(board, rootBoard, variant)
				.then(function(result) {
					debugOuter('completed innerMcts loop. occurence # ' + mctsIterations + '.')
					++mctsIterations;
					callback(null, result);
				})
				.catch(function(error) {
					callback(error)
				})
		},
		function whileTest() {
			let debugInnerLoopDur = Date.now() - debugInnerLoopStart
				, continueLoop = (Date.now() < stopTime)
			debugOuter('one loop completed in ' + debugInnerLoopDur + ' ms. repeat? ' + continueLoop)
			return continueLoop;
		},
		function result(error, result) {
			if (error) {
				deferred.reject('[mcts.loop]: error at iteration ' + mctsIterations + ': ' + JSON.stringify(error))
			} else {
				debugOuter('final bestChild call to select move we will play.')
				let debugBestChildStart = Date.now();
				bestChild(result, 0)
					.then(function(tuple) {
						let debugBestChildDur = Date.now() - debugBestChildStart;
						debugOuter('final bestChild completed in ' + debugBestChildDur + ' ms.')
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
	 * @param  {Object} start              - variant.generalized game board JSON object, start of this search
	 * @param  {Object} rootBoard          - generalized board object for the root board
	 * @param  {Object} variant            - ?singleton object with game-specific function implementation (unused?)
	 * @return {Promise}             			 - a best child, or, error
	 */
	function innerMcts (start, rootBoard, variant) {
		var deferred = Q.defer()

		debugInner('starting innerMcts loop with start, variant:')
		debugInner(start)
		debugInner(variant)
		let debugStartTime = Date.now();
		mergeNode(start)
			.then(function(v0) {
				debugInner('top index is ' + v0.index)
				let debugMergeDur = Date.now() - debugStartTime;
				debugInner('mergeNode done in ' + debugMergeDur + ' ms.')
				treePolicy(v0, variant)
					.then(function(generalizedBoard) {
						generalizedBoard.Steps = config.get('clips.Steps') || 0;
						let debugTreePolicyDur = (Date.now() - debugStartTime) - debugMergeDur;
						debugInner('treePolicy done in ' + debugTreePolicyDur + ' ms.')
						defaultPolicy(generalizedBoard)
							.then(function(reward) {
								_.unset(generalizedBoard, 'Steps');
								// reward = Math.random() < 0.5 ? 0 : 1;  // debug random rewards
								let debugDefaultPolicyDur = (Date.now() - debugStartTime) - debugMergeDur - debugTreePolicyDur;
								debugInner('defaultPolicy done in ' + debugDefaultPolicyDur + ' ms.')
								backup(generalizedBoard, rootBoard, reward)
									.then(function(finished) {
										let debugBackupDur = (Date.now() - debugStartTime) - debugMergeDur - debugTreePolicyDur - debugDefaultPolicyDur;
										debugInner('backup done in ' + debugBackupDur + ' ms.')
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