'use strict';
{
	var request = require('request')
		, _ = require('lodash')
		, config = require('config')
		, auth = new Buffer(config.get('neo4j.username') + ':' + config.get('neo4j.password'))
		, neo4j = request.defaults({
			method: 'POST',
			url: config.get('neo4j.baseUrl'),
			headers: {
				Authorization: 'Basic ' + auth.toString('base64')
			}})	

	module.exports = function(req, res, next) {
		var imSure = _.get(req.params, 'imsure')
		if (imSure !== 'yesimsure') {
			next('[deleteAll.middleware]: i don\'t think you\'re sure. if you say DELETE /yesimsure then i will.');
		} else {
			try {
				neo4j({json:helper.constructQueryBody(['MATCH (p)-[r]-() DELETE p,r','MATCH (p) DELETE p'],[{},{}])}, function(err, response, body) {
					if (err) {
						throw new Error(err)
					} else {
						res.locals = body;
						next();
					}
				})
			} catch (e) {
				next(e);
			}
		}
	}

}