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
					moveCount: 0
				})
				expect(id0).to.equal('0')
			})
			it('when making new processes, it should store them with sequential ids', function() {
				var id1 = monitor.newProcess({
					gameVariant: 'variant2',
					subVariant: 'HUvAI',
					moveCount: 0
				})
				var id2 = monitor.newProcess({
					gameVariant: 'variant3',
					subVariant: 'HUvHUvAI',
					moveCount: 0
				})
				var numKeys = Object.keys(monitor.getProcess()).length
				for (var i = 0; i < numKeys; ++i) {
					expect(monitor.getProcess()).to.have.ownProperty(i.toString())
				}				
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
					moveCount: 0
				}
				id4Object = {
					gameVariant: id4TestText,
					subVariant: 'HUvHUvAI',
					moveCount: 0
				}
				id3 = monitor.newProcess(id3Object)
				id4 = monitor.newProcess(id4Object) 				
			})
			it('should get one by id', function() {
				var lastId = id4;
				var lastProcessObject = monitor.getProcess(lastId);
				expect(lastProcessObject).to.eql(id4Object)
			})
			it('calling getProcess without an id should return the process list', function() {
				var processes = monitor.getProcess();
				expect(processes[id3]).to.equal(id3Object)
				expect(processes[id4]).to.equal(id4Object)
			})
		})		
		describe('updateProcess()', function() {
			it('can modify moveCount for an active process', function() {
				var id5 = monitor.newProcess({
					gameVariant: 'variant5',
					subVariant: 'HUvHUvHU',
					moveCount: 0
				})
					, updatedValue = 100;
				monitor.updateProcess(id5, updatedValue)
				expect(monitor.getProcess(id5).moveCount).to.equal(updatedValue)				
			})
		})
		describe('deleteProcess()', function() {
			it('we should be able to delete the 0th process, and if we make another process, it should get the id 0', function() {
				var id6 = monitor.newProcess({
					gameVariant: 'variant6',
					subVariant: 'HUvAI',
					moveCount: 0
				})
				var id7 = monitor.newProcess({
					gameVariant: 'variant7',
					subVariant: 'HUvHUvAI',
					moveCount: 0
				})				
				var currentIds = Object.keys(monitor.getProcess());
				var removeIdZero = currentIds.filter(function(v, index) { return index != 0; });
				monitor.deleteProcess('0');
				expect(monitor.getProcess()).to.not.have.ownProperty('0')
				expect(monitor.getProcess()).to.have.all.keys(removeIdZero)
				var newId0 = monitor.newProcess({
					gameVariant: 'variant6',
					subVariant: 'HUvHU',
					moveCount: 0
				})
				expect(newId0).to.equal('0')
				expect(monitor.getProcess()).to.have.ownProperty('0')
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