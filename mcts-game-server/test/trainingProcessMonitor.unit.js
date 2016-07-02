'use strict';
{
	var expect = require('chai').expect;	
	var monitor = require('../lib/trainingProcessMonitor');


	describe('trainingProcessMonitor', function() {
		describe('newProcess()', function() {
			it('should return an id', function() {
				var id0 = monitor.newProcess({
					gameVariant: 'variant',
					subVariant: 'AIvAI',
					moveCount: 0,
					board: 'some board'
				})
				expect(id0).to.equal('1')
			})
			it('when making new processes, it should store them with sequential ids', function() {
				var id1 = monitor.newProcess({
					gameVariant: 'variant2',
					subVariant: 'HUvAI',
					moveCount: 0,
					board: 'some board'
				})
				var id2 = monitor.newProcess({
					gameVariant: 'variant3',
					subVariant: 'HUvHUvAI',
					moveCount: 0,
					board: 'some board'
				})
				var numKeys = Object.keys(monitor.getProcess()).length
				for (var i = 1; i <= numKeys; ++i) {
					expect(monitor.getProcess()).to.have.ownProperty(i.toString())
				}				
			})
			it('can take a board as a parameter', () => {
				var hasBoard = monitor.newProcess({
					gameVariant: 'variant3',
					subVariant: 'HUvHUvAI',
					moveCount: 0,
					board: {game: 'state'}
				})
				var lastKey = Object.keys(monitor.getProcess()).length.toString()
				expect(monitor.getProcess()[lastKey].board.game).to.equal('state')
			})
		})
		describe('getProcess()', function() {
			var id3, id3TestText, id3Object, id4, id4TestText, id4Object;
			before(function() {
				id3TestText = 'something worth finding maybe';
				id4TestText = 'nobody wants to see this';
				id3Object = {
					gameVariant: id3TestText,
					subVariant: 'HUvAI',
					moveCount: 0,
					board: 'some board'
				}
				id4Object = {
					gameVariant: id4TestText,
					subVariant: 'HUvHUvAI',
					moveCount: 0,
					board: 'some board'
				}
				id3 = monitor.newProcess(id3Object)
				id4 = monitor.newProcess(id4Object) 				
			})
			it('should get one by id', function() {
				var lastId = id4;
				var lastProcessObject = monitor.getProcess(lastId);

				expect(lastProcessObject[lastId]).to.eql(id4Object)
			})
			it('calling getProcess without an id should return the process list', function() {
				var processes = monitor.getProcess();
				expect(processes[id3]).to.equal(id3Object)
				expect(processes[id4]).to.equal(id4Object)
			})
		})		
		describe('updateProcess()', function() {
			it('can modify moveCount and board for an active process', function() {
				var id5 = monitor.newProcess({
					gameVariant: 'variant5',
					subVariant: 'HUvHUvHU',
					moveCount: 0,
					board: 'old board'
				})
					, updatedValue = 100
					, updatedBoard = 'new board'
				monitor.updateProcess(id5, updatedValue, updatedBoard)
				var shouldBeUpdated = monitor.getProcess(id5)[id5]
				expect(shouldBeUpdated.moveCount).to.equal(updatedValue)
				expect(shouldBeUpdated.board).to.equal(updatedBoard)
			})
		})
		describe('deleteProcess()', function() {
			it('we should be able to delete the 0th process, and if we make another process, it should get the id 0', function() {
				var id6 = monitor.newProcess({
					gameVariant: 'variant6',
					subVariant: 'HUvAI',
					moveCount: 0,
					board: 'some board'
				})
				var id7 = monitor.newProcess({
					gameVariant: 'variant7',
					subVariant: 'HUvHUvAI',
					moveCount: 0,
					board: 'some board'
				})				
				var currentIds = Object.keys(monitor.getProcess());
				var removeIdOne = currentIds.filter(function(v, index) { return index != 0; });
				monitor.deleteProcess('1');
				expect(monitor.getProcess()).to.not.have.ownProperty('1')
				expect(monitor.getProcess()).to.have.all.keys(removeIdOne)
				var newId1 = monitor.newProcess({
					gameVariant: 'variant6',
					subVariant: 'HUvHU',
					moveCount: 0,
					board: 'some board'
				})
				expect(newId1).to.equal('1')
				expect(monitor.getProcess()).to.have.ownProperty('1')
			})
			it('cleanup', function() {
				var currentIds = Object.keys(monitor.getProcess());
				currentIds.forEach(function(id) {
					monitor.deleteProcess(id)
				})
				expect(monitor.getProcess()).to.be.empty;
			})
		})
	})
}