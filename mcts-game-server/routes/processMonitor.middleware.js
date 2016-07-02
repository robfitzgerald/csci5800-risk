'use strict';
{
	var _ = require('lodash')
	module.exports = function(monitor) {
		return function(req, res, next) {
			let p = Number.parseInt(_.get(req.params, 'process'))
			if (typeof p === 'number' && !Number.isNaN(p)) {
				res.send('process ' + p + ': ' + JSON.stringify(monitor.getProcess(p)))
			} else {
				res.send('current processes: ' + JSON.stringify(monitor.getProcess()))
			}
		}
	}
}