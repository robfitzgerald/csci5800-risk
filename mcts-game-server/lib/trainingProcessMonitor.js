'use strict';
{
	let debug = require('debug')('mcts:lib:processMonitor')
		, _ = require('lodash')

	module.exports = {
		Process,
		getProcess,
		newProcess,
		updateProcess,
		triggerEndProcess,
		endProcessIsRequested,
		deleteProcess,
	}

	/**
	 * Class for a new training process monitor entry
	 * @param {string} gameVariant name of the game variant being used (i.e. risk)
	 * @param {string} subVariant  name of the sub-variation, such as the types of players playing
	 * @param {number} moveCount   number of moves that have occurred
	 * @param {string} board       current board state
	 */
	function Process(gameVariant, subVariant, moveCount, board) {
		this.gameVariant = gameVariant;
		this.subVariant = subVariant;
		this.moveCount = moveCount;
		this.board = board;
		this.endProcess = false;
	}

	var processListMap = {};

	function getProcess(requestedId) {
		if (requestedId) {
			let output = {};
			output[requestedId] = processListMap[requestedId];
			return output;
		} else {
			return processListMap;
		}
	}

	function newProcess(p) {
		processListSchemaTest(p);
		p.endProcess = false;
		var newId = 1
			, stillChoosingAnId = true;
		do {
			if (!processListMap.hasOwnProperty(newId)) {
				stillChoosingAnId = false;
				processListMap[newId] = p;
			} else {
				newId++;
			}
		} while(stillChoosingAnId)
		return newId.toString();
	}

	function updateProcess(id, newMoveCount, board) {
		if (!Number.isInteger(newMoveCount) || newMoveCount < 0) {
			throw new TypeError('[trainingProcessMonitor] updated move count value is not an integer or is negative: ' + newMoveCount);
		}
		if (!processListMap.hasOwnProperty(id)) {
			debug('process monitor trying to update a process that does not exist with processId: ' + id);
		} else {
			let p = processListMap[id];
			p.moveCount = newMoveCount;
			if (board) {
				p.board = board;
			}
		}
	}

	function triggerEndProcess(id) {
		if (id && !processListMap.hasOwnProperty(id)) {
			debug('process monitor trying to trigger ending a process that does not exist with processId: ' + id);
			return false;
		} else if (id) {
			processListMap[id].endProcess = true;
			return true;
		} else {
			_.forEach(processListMap, (proc) => {
				proc.endProcess = true;
			})
			return true;
		}
	}

	function endProcessIsRequested (id) {
		if (id && !processListMap.hasOwnProperty(id)) {
			debug('process monitor trying to test if user has requested to end this process that does not exist with processId: ' + id)
		} else {
			return processListMap[id].endProcess;
		}
	}

	function deleteProcess(id) {
		if (!processListMap.hasOwnProperty(id)) {
			debug('process monitor trying to delete a process that does not exist with processId: ' + id);
		} else {
			delete processListMap[id];
		}		
	}

	function processListSchemaTest (p) {
		if (typeof p !== 'object') {
			throw new TypeError('[trainingProcessMonitor] new process data should be an object, but was instead ' + p)
		}
		if (!p.gameVariant || typeof p.gameVariant !== 'string') {
			throw new TypeError('[trainingProcessMonitor] new process has invalid gameVariant: ' + p.gameVariant)
		}
		if (!p.subVariant || typeof p.subVariant !== 'string') {
			throw new TypeError('[trainingProcessMonitor] new process has invalid subVariant: ' + p.subVariant)			
		}
		if (!p.hasOwnProperty('moveCount') || !Number.isInteger(p.moveCount) || p.moveCount < 0) {
			throw new TypeError('[trainingProcessMonitor] new process has invalid moveCount: ' + p.moveCount)						
		}
		if (!p.hasOwnProperty('board')) {
			throw new TypeError('[trainingProcessMonitor] new process is missing board property.')
		}
	}
}