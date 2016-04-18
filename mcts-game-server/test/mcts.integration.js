'use strict';
{
	var expect = require('chai')
		, mcts = require('../lib/mcts')
		, variant = require('../gameVariant/risk')
		, board = variant.generate('Risk', [{type:'AI'},{type:'HUMAN'}])
		, kbase = require('../lib/knowledgeBase')
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

	describe('treePolicy()', function() {
		it('start from simple', function() {
			// neo4j({json: helper.constructQueryBody('MATCH (n)-[r]-() DELETE n,r')}, 
			// 	function(err, response, body) {
			// 		if (err) {
			// 			done(err)
			// 		}
					var generalizedParentBoard = variant.generalize(board)
					kbase.createNewRoot(generalizedParentBoard, [{name:'test',params:[]},{name:'test2',params:['param1']}])
						.then(function(root) {
							console.log('fresh roots')
							console.log(root)
							done();
						})
						.catch(function() {
							done(new Error('createNewRoot failed'))
						})
				// })
		})
	})

	describe.skip('mcts', function() {

		this.timeout(10000); // set 10 second timeout on asynchronous tests

		it.skip('create a new root then run mcts', function(done) {
			var generalizedParentBoard = variant.generalize(board)
			kbase.createNewRoot(generalizedParentBoard, [{name:'test',params:[]},{name:'test2',params:['param1']}])
				.then(function(res) {
					console.log('test: success')
					console.log(res)
					mcts(generalizedParentBoard)
						.then(function(mctsDone) {
							console.log('test: mcts success')
							console.log(mctsDone)
							done();
						})
						.catch(function(mctsErr) {
							console.log('test: mcts error')
							console.log(mctsErr)
							return done(mctsErr);
						})
				})
				.catch(function(err) {
					console.log('test: create new root failure')
					console.log(err)
					return done(err);
				})			
		})
	})
	it.skip('bestChild on existing parent', function(done) {
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