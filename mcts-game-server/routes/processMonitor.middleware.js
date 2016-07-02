'use strict';
{
	var _ = require('lodash')
	module.exports = function(monitor) {
		return function(req, res, next) {
			let p = Number.parseInt(_.get(req.params, 'process'))
			if (typeof p === 'number' && !Number.isNaN(p)) {
				res.send(processResponse(monitor.getProcess(p)))
			} else {
				res.send(processResponse(monitor.getProcess()))
			}
		}
	}

	function processResponse(processListMap) {
		let outputHeader = `
		<html>
			<head>
				<title>Process Report</title>
			</head>
			<body>
				<h1>Process Report</h1>
		`
			, outputBody = ''
			, outputFooter = `</body></html>`
		_.forEach(processListMap, (v, k) => {
			outputBody += `
		<div>
			<p>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</p>
			<p>Process Number ${k}:</p>
			<ul>
				<li>Game Variant: ${v.gameVariant}</li>
				<li>Sub Variant: ${v.subVariant}</li>
				<li>Current Move Count: ${v.moveCount}</li>
				<code>Board State: ${JSON.stringify(v.board, null, '<br/>')}</code>
			</ul>
			<p>~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</p>
		</div>
		`
		})
		return outputHeader + outputBody + outputFooter;
	}
}