'use strict';
{
	var expect = require('chai').expect
		, mcts = require('../lib/mcts')
		, variant = require('../gameVariant/risk')
		, kbase = require('../lib/knowledgeBase')
		, helper = require('../lib/knowledgeBase.helper.js')
		, clipsModule = require('clips-module')
		, request = require('request')
		, config = require('config')
		, auth = new Buffer(config.get('neo4j.username') + ':' + config.get('neo4j.password'))
		, neo4j = request.defaults({
			method: 'POST',
			url: config.get('neo4j.baseUrl'),
			headers: {
				Authorization: 'Basic ' + auth.toString('base64')
			}})



/*
note for group:
due to neo4j's limitations, we will have to make the params array on an action object contain members all of the same type: 
`{"code":"Neo.ClientError.Statement.InvalidType","message":"Collections containing mixed types can not be stored in properties."}`
so, that's in reference to the example where actions[1].params = ["NorthwestTerritorty","Alberta",1].  the 1 will need to be a "1".  we can leverage (1 === Number.parseInt("1"))
 */


	describe('mcts integration testing', function() {
		this.timeout(0); // 20000 = 20sec, 60000 = 60sec, 0 = no timeout..
		var rootData;
		before(function(done) {
			rootData = variant.rootNodeData();
			done();
		})
		it('delete everything (heads up - destructive!!)', function(done) {
			neo4j({json:helper.constructQueryBody(['MATCH (p)-[r]-() DELETE p,r','MATCH (p) DELETE p'],[{},{}])}, function(err) {
				if (err) {
					done(new Error(err))
				}
				done();
			})
		})
		it('create root', function(done) {
			kbase.createNewRoot(rootData.board, rootData.moves)
				.then(function(result) {
					expect(result).to.have.property('root')
					done();
				})
		})
		it.skip('mergeNode on existing node', function(done) {
			kbase.mergeNode(rootData.board)
				.then(function(res) {
					expect(res).to.exist;
					done();
				})
				.catch(function(err) {
					done(new Error(JSON.stringify(err)))
				})
		})
		it.skip('defaultPolicy on existing board', function(done) {
			clipsModule.simulate(rootData.board)
				.then(function(reward) {
					console.log('reward is ' + reward)
					done()
				})
		})
		it.skip('hand crank mcts', function(done) {
			mcts.innerMcts(rootData.board, variant)
				.then(function(result) {
					done();
				})
				.catch(function(err) {
					done(new Error(JSON.stringify(err)))
				})
		})
		it('mcts loop for 40 seconds', function(done) {
			mcts.mcts(rootData.board, variant, 40000)
				.then(function(result) {
					done();
				})
				.catch(function(mctsErr) {
					done(new Error(JSON.stringify(mctsErr)));
				})				
		})
	/*	describe.skip('create root, expand a move, create children', function() {
			it('start from simple', function(done) {
						var generalizedParentBoard = variant.generalize(board)
							, boardNode = {index: helper.hash(helper.serialize(generalizedParentBoard))}
						kbase.createNewRoot(generalizedParentBoard, [{name:'test',params:[]},{name:'test2',params:['param1']}])
							.then(function(root) {
								variant.expand(generalizedParentBoard, {name:'test',params:[]})
									.then(function(children) {
										kbase.createChildren(boardNode, {name:'test',params:[]}, children)
											.then(function(created) {
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
		})
		describe.skip('mcts', function() {
			it('run mcts', function(done) {
				var generalizedParentBoard = variant.generalize(board)
				mcts.innerMcts(generalizedParentBoard, variant)
					.then(function(mctsDone) {
						done();
					})
					.catch(function(mctsErr) {
						return done(new Error(JSON.stringify(mctsErr)));
					})	
			})
			it('bestChild setup', function(done) {
				// 2919900703
				neo4j({json:helper.constructQueryBody([`
					MATCH (b:BOARD {index: 2919900703})
					WITH b
					SET b.visits = 5, b.rewards = 2`,
					`MATCH (c:BOARD {index: 3895442334})
					WITH c
					SET c.visits = 7, c.rewards = 3`,
					`MATCH (d:BOARD {index: 344856511})
					WITH d
					SET d.visits = 2, d.rewards = 1
					`],[{},{},{}])}, function(err, response, body) {
						expect(err).to.not.exist;
						done();
				})					
			})
			it('getNode, btw, exists', function(done) {
				kbase.getNode(3895442334)
					.then(function(res) {
						expect(res.board).to.exist;
						done();
					})
					.catch(function(err) {
						done(new Error(JSON.stringify(err)))
					})
			})
			it('bestChild on existing parent, cp=0', function(done) {
				var generalizedParentBoard = variant.generalize(board)
					, cp = 0;
				kbase.getNode(3895442334)
									.then(function(treeNode) {
										kbase.bestChild(treeNode, cp)
											.then(function(result) {
												expect(result.uct).to.equal(0.5)
												done();
											})
											.catch(function(err) {
												done(err)
											})
									})
									.catch(function(err) {
										done(new Error(JSON.stringify(err)))
									})
			})	
			it('bestChild on existing parent, cp=1/sqrt(2)', function(done) {
				var cp = config.get('mcts.explorationParameter')
				kbase.getNode(3895442334)
					.then(function(treeNode) {
						kbase.bestChild(treeNode, cp)
							.then(function(result) {
								var oneVal = ((1.0/2.0) + (cp * ((Math.sqrt((2.0 * Math.log(7)))) / 2.0)))
								// console.log('is this one of the values? ' + oneVal)
								expect(result.board).to.exist
								done();
							})
							.catch(function(err) {
								done(err)
							})
					})
					.catch(function(err) {
						done(new Error(JSON.stringify(err)))
					})
			})
			it('mergeNode making a new node and calling expand on it', function(done) {
				var generalizedParentBoard = variant.generalize(board)
				generalizedParentBoard.Turn = 1000;
				kbase.mergeNode(generalizedParentBoard)
					.then(function(res) {
						expect(res).to.exist;
						done();
					})
					.catch(function(err) {
						done(new Error(JSON.stringify(err)))
					})
			})
			it('treePolicy will descend tree at this point', function(done) {
				var generalizedParentBoard = variant.generalize(board)
				mcts.innerMcts(generalizedParentBoard, variant)
					.then(function(result) {
						console.log('test: mcts success')
						console.log(result)
						done();
					})
					.catch(function(mctsErr) {
						done(new Error(JSON.stringify(mctsErr)));
					})					
			})
			it('finally, let us test the while-wrapped version', function(done) {
				var generalizedParentBoard = variant.generalize(board)
				mcts.mcts(generalizedParentBoard, variant, 4000)
					.then(function(result) {
						console.log('test: mcts success')
						console.log(result)
						done();
					})
					.catch(function(mctsErr) {
						done(new Error(JSON.stringify(mctsErr)));
					})				
			})
		})	*/
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

}