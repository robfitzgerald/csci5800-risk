'use strict';
{

	module.exports = {
		Process,
		getProcess,
		newProcess,
		updateProcess,
		deleteProcess,
	}

	/**
	 * Class for a new training process monitor entry
	 * @param {string} gameVariant name of the game variant being used (i.e. risk)
	 * @param {string} subVariant  name of the sub-variation, such as the types of players playing
	 * @param {number} moveCount   number of moves that have occurred
	 */
	function Process(gameVariant, subVariant, moveCount) {
		this.gameVariant = gameVariant;
		this.subVariant = subVariant;
		this.moveCount = moveCount;
	}

	var processListMap = {};

	function getProcess(requestedId) {
		if (requestedId) {
			return processListMap[requestedId]
		} else {
			return processListMap;
		}
	}

	function newProcess(p) {
		processListSchemaTest(p);
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

	function updateProcess(id, newMoveCount) {
		if (!Number.isInteger(newMoveCount) || newMoveCount < 0) {
			throw new TypeError('[trainingProcessMonitor] updated move count value is not an integer or is negative: ' + newMoveCount);
		}
		if (!processListMap.hasOwnProperty(id)) {
			console.log('[trainingProcessMonitor] process monitor trying to update a process that does not exist with processId: ' + id);
		} else {
			let p = processListMap[id];
			p.moveCount = newMoveCount;
		}
	}
	function deleteProcess(id) {
		if (!processListMap.hasOwnProperty(id)) {
			console.log('[trainingProcessMonitor] process monitor trying to delete a process that does not exist with processId: ' + id);
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
	}
}