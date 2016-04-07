'use strict';
{
	var mcts = require('../lib/mcts')
		, variant = require('../gameVariant/risk')
		, board = variant.generate('Risk', [{type:'AI'},{type:'HUMAN'}])
		, neo4j = require('../lib/knowledgeBase')
		, serialize = require('../lib/knowledgeBase.helper.js').serialize
		, newRoot = variant.generalize(variant.generate(board.gameVariant, board.playerDetails))

	describe('mcts', function() {
		it('create a new root then run mcts', function(done) {
			neo4j.createNewRoot(newRoot, [{name:'test',params:[]},{name:'test2',params:['param1']}])
				.then(function(res) {
					console.log('success')
					console.log(res)
					mcts(board, variant)
						.then(function(mctsDone) {
							console.log('mcts success')
							console.log(mctsDone)
							done();
						})
						.catch(function(mctsErr) {
							console.log('mcts error')
							console.log(mctsErr)
							done();
						})
				})
				.catch(function(err) {
					console.log('failure')
					console.log(err)
					done();
				})			
		})
	})


}