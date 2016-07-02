'use strict';
{
	let Q = require('Q')
		, _ = require('lodash')
		, debug = require('debug')('mcts:database:core:configureDatabase')
		, helper = require('../database.helper')
	/**
	 * database settings
	 * @return {Promise}  - nothing useful beyond success/failure callbacks being called.
	 */
	module.exports = function(neo4j) {
		return function configureDatabase() {
			var deferred = Q.defer() 
			,	statements = [
		 	 // `CREATE INDEX ON :BOARD(index)`
		 	 `CREATE CONSTRAINT ON (b:BOARD) ASSERT b.index IS UNIQUE`
			]
			, params = [
				{}
			]
			, payload = helper.constructQueryBody(statements,params);
			neo4j({json: payload}, function(err, res, body) {
				var neo4jError = _.get(body, 'errors')
					,	errors = err || ((neo4jError.length > 0) ? helper.parseNeo4jError('createNewRoot', body) : null);
				if (errors) {
					deferred.reject(errors);
				} else {
					debug('configureDatabase call completed with following statements applied to database:')
					debug(JSON.stringify(statements))
					deferred.resolve(body);
				}			
			})
			return deferred.promise;
		}	
	}
}