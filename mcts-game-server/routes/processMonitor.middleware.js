'use strict';
{
	var _ = require('lodash')
	var debug = require('debug')('mcts:routes:processMonitor')
	module.exports = {
		getInfo,
		endProcess
	}

	function getInfo (monitor, verbose) {
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
			processedResponse = formatProcessResponse(monitorResponse)
			res.send(processedResponse)
		}
	}

	function endProcess (monitor) {
		return function (req, res) {
			let proc = _.get(req.params, 'process')
				, procNumber = Number.parseInt(proc)
				, procNumberIsGood = typeof procNumber === 'number' && !Number.isNaN(procNumber)
				, success = false;
			if (procNumberIsGood) {
				success = monitor.triggerEndProcess(procNumber);
			} else if (typeof proc === 'string' && proc.toLowerCase() === 'all'){
				success = monitor.triggerEndProcess();
			}
			if (success) {
				let whichProcesses = procNumberIsGood ? 'process # ' + procNumber : 'all processes' 
				res.send(formatGenericResponse('Cancel has been triggered for ' + whichProcesses))
			} else {
				res.send(formatGenericResponse('Unable to end requested process(es).'))
			}
		}
	}

	function formatGenericResponse(data) {
		return '<html><head><title></title></head><body>' + data.toString() + '</body></html>'
	}

	function formatProcessResponse(processListMap) {
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