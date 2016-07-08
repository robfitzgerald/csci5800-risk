'use strict';
{
	var _ = require('lodash')
	var debug = require('debug')('mcts:routes:processMonitor')
	module.exports = function(monitor, verbose) {
		return function(req, res) {
			let p = Number.parseInt(_.get(req.params, 'process'))
				, monitorResponse, processedResponse;
			if (typeof p === 'number' && !Number.isNaN(p)) {
				monitorResponse = monitor.getProcess(p)
			} else {
				monitorResponse = monitor.getProcess()
			}
			if (!verbose) {
				debug('removing board data')
				_.forEach(monitorResponse, (proc) => {
					debug('has a board property: ' + proc.hasOwnProperty('board'))
					_.set(proc, 'board', '[not shown]')
					debug('board property is now ' + _.get(proc, 'board'))
				})
			}
			processedResponse = processResponse(monitorResponse)
			res.send(processedResponse)
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