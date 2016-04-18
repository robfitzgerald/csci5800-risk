'use strict';
{
	var expect = require('chai')
		, mcts = require('../lib/mcts')
		, variant = require('../gameVariant/risk')
		, board = variant.generate('Risk', [{type:'AI'},{type:'HUMAN'}])
		, kbase = require('../lib/knowledgeBase')
		, simulation = require('../lib/clipsController')
		, helper = require('../lib/knowledgeBase.helper.js')
		, request = require('request')
		, config = require('config')
		, auth = new Buffer(config.get('neo4j.username') + ':' + config.get('neo4j.password'))
		, neo4j = request.defaults({
			method: 'POST',
			url: config.get('neo4j.baseUrl'),
			headers: {
				Authorization: 'Basic ' + auth.toString('base64')
			}})

	describe('mcts integration testing (heads up - destructive!!)', function() {
		this.timeout(10000); // set 10 second timeout on asynchronous tests
		it('delete everything', function(done) {
			neo4j({json:helper.constructQueryBody('MATCH (p)-[r]-() DELETE p,r')}, function(err) {
				if (err) {
					done(new Error(err))
				}
				done();
			})
		})
		describe('create root, expand a move, create children', function() {
			it('start from simple', function(done) {
						var generalizedParentBoard = variant.generalize(board)
							, boardNode = {index: helper.hash(helper.serialize(generalizedParentBoard))}
						kbase.createNewRoot(generalizedParentBoard, [{name:'test',params:[]},{name:'test2',params:['param1']}])
							.then(function(root) {
								console.log('done creating')
								simulation.expand(generalizedParentBoard, {name:'test',params:[]})
									.then(function(children) {
										console.log('simulation.expand() result:')
										console.log(children)
										kbase.createChildren(boardNode, {name:'test',params:[]}, children)
											.then(function(created) {
												console.log('createChildren result')
												console.log(created)
												done();
											})
											.catch(function(err1) {
												done(new Error(JSON.stringify(err1)))
											})
									})
									.catch(function(err2) {
										done(new Error(JSON.stringify(err2)))
									})
							})
							.catch(function(err3) {
								done(new Error(JSON.stringify(err3)))
							})
			})
		describe('mcts', function() {
					it('run mcts', function(done) {
						var generalizedParentBoard = variant.generalize(board)
						mcts(generalizedParentBoard, variant)
							.then(function(mctsDone) {
								console.log('test: mcts success')
								// mcts(generalizedParentBoard, variant)
								// 	.then(function(shouldHaveThreeLayers) {
								// 		done();
								// 	})
								// 	.catch(function(err) {
								// 		done(new Error(err))
								// 	})
								done();
							})
							.catch(function(mctsErr) {
								console.log('test: mcts error')
								console.log(mctsErr)
								return done(mctsErr);
							})	
					})
				})
				it.skip('bestChild on existing parent', function(done) {
					var generalizedParentBoard = variant.generalize(board)
					kbase.bestChild(board, 0)
						.then(function(res) {
							console.log('bestChild() result:')
							console.log(res)
							done();
						})
						.catch(function(err) {
							console.log(err)
							done(err)
						})
				})		
			})		
		})



	// backup({state:'sloop'}, null, 1)
	// 	.then(function(res){ console.log(JSON.stringify(res)); })
	// 	.catch(function(err) { console.log(err) })
	// console.log(helper.deserializeBoard('puppies'))
	// console.log(helper.serializeBoard('sloop'))
	// bestChild('betsy', 0)
	// 	.then(function(res) { console.log(JSON.stringify(res))})
	// 	.catch(function(err) { console.log(err)})
	// debugGenerateTestChildren(2, '55555');
	

	// ---TEST---
	// createNewRoot('betsy', [{name:'moves', params: ["asdf","sdfg","dfgh","fghj"]}, {name:'flooves', params: []}, {name:'shuld be not takey', params: []}])
	//  	.then(function(res) { 
	//  		// console.log('createNewRoot.then()')
	//  		// console.log(res)
	//  		createChildren('betsy', {name:'moves', params: ["asdf","sdfg","dfgh","fghj"]}, 
	//  			[
	// 		 		{
	// 		 			state: 'ronnie',
	// 		 			moves: [{name:'asdf', params: ["asdf","sdfg","dfgh","fghj"]}],
	// 		 			nonTerminal: true
	// 		 		},{
	// 		 			state: 'zuko',
	// 		 			moves: [{name:'fghah', params: []}],
	// 		 			nonTerminal: true
	// 		 		}
	// 	 		])
	//  			.then(function(res2) {
	//  				// console.log('createChildren.then()')
	//  				// console.log(res2)
	// 				treePolicy('betsy')
	// 					.then(function(res) {
	// 						// console.log('treePolicy success');
	// 						// console.log(JSON.stringify(res))
							// var i = 0
							// 	, generate = 5
							// 	, counter = Date.now();	
							// async.whilst(function() { return i < generate }
							// 	, function(callback) {
							// 		i++;
							// 		treePolicy('betsy')
							// 			.then(function(res) { console.log('treePolicy result: '); console.log(res); callback(null, res)})
							// 			.catch(function(err) { callback(err)})
							// 	},
							// 	function(error, result) {
							// 		console.log(generate + ' done in ' + (Date.now() - counter) + ' ms')
							// 		console.log(result)
							// 	})
	// 					})
	// 					.catch(function(err) {console.log('treePolicy error'); console.log(err)})
	//  			})
	//  			.catch(function(err2) {
	//  				console.log('createChildren.catch()')
	//  				console.log(err2)
	//  			})
	//  	}) // just in here for testing
	//  	.catch(function(err) { 
	// 		console.log('createNewRoot.catch()')
	//  		console.log(err) 
	//  	});

}