'use strict';

{
    var generateRandomState = require(__dirname + '/generateRandomState.helper')
        , stateToVector = require(__dirname + '/stateToVector.helper')
        , clips = require(__dirname + '/clips.middleware')
        , Network = require('mlearningjs').Network
        , v = require('vectorious')
        , fs = require('fs')
        , Matrix = v.Matrix;

    var network = new Network(35, 200);
    network.addLayer(5000, 0.01);
    network.addReLU();
    network.addLayer(2, 0.1);
    network.addReLU();
    network.addSoftmax();
    network.useCrossEntropyLoss();

    network.train(100000, (batchSize) => {
        var xArray = [];
        var yArray = [];
        for (var i = 0; i < batchSize; ++i) {
            var state = generateRandomState();
            yArray.push(clips(state));
            xArray.push(stateToVector(state));
        }

        return {
            X: new Matrix(xArray).transpose(),
            Y: new Matrix([yArray])
        }
    });

}