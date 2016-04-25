{
	var expect = require('chai').expect
		, helper = require('../lib/knowledgeBase.helper')

	describe('helper', function() {
		describe('serializeAction', function() {
			it('should transform actions with zero params', function() {
				var action = {
					name: 'test',
					params: []
				}
					, result = helper.serializeAction(action);
				expect(result).to.equal('test:')
			})
			it('should transform actions with one param', function() {
				var action = {
					name: 'test',
					params: [
						'param1'
					]
				}
					, result = helper.serializeAction(action);
				expect(result).to.equal('test:param1')				
			})
			it('should transform actions with two params', function() {
				var action = {
					name: 'test',
					params: [
						'param1',
						'param2'
					]
				}
					, result = helper.serializeAction(action);
				expect(result).to.equal('test:param1,param2')				
			})
		})
		describe('deserializeAction', function() {
			it('should transform actions with zero params', function() {
				var action = 'test:'
					, result = helper.deserializeAction(action);
				expect(result.name).to.equal('test')
				expect(result.params.length).to.equal(0);
			})
			it('should transform actions with one param', function() {
				var action = 'test:param1'
					, result = helper.deserializeAction(action);
				expect(result.name).to.equal('test')
				expect(result.params.length).to.equal(1);
				expect(result.params[0]).to.equal('param1')
			})
			it('should transform actions with two params', function() {
				var action = 'test:param1,param2'
					, result = helper.deserializeAction(action);
				expect(result.name).to.equal('test')
				expect(result.params.length).to.equal(2);
				expect(result.params[0]).to.equal('param1')
				expect(result.params[1]).to.equal('param2')				
			})			
		})
	})

}