'use strict';

{
    var generateRandomState = require(__dirname + '/generateRandomState.helper')
        , stateToVector = require(__dirname + '/stateToVector.helper')
        , tensorize = require(__dirname + '/tensorize.helper')
        , clips = require(__dirname + '/clips.middleware')
        , Network = require('mlearningjs').Network
        , Tensor3D = require('mlearningjs').Tensor3D
        , v = require('vectorious')
        , Vector = v.Vector
        , Matrix = v.Matrix;

    var network = new Network([10, 10, 7]);
    network.addConvolutionalLayer(90, 3, 7, 1, 0.0001)
    network.addTensor3D2VectorLayer();
    network.addReLU();
    network.addLayer(2000, 0.01);
    network.addReLU();
    network.addLayer(2, 0.01);
    network.addReLU();
    network.addSoftmax();
    network.useCrossEntropyLoss();

    network.train(100000, 500, () => {
        var state = generateRandomState();
        var y = clips(state);
        var x = tensorize(state);

        for (var i = 0; i < x.length; ++i) {
            x[i] = new Matrix(x[i]);
        }

        return {
            X: new Tensor3D(x),
            Y: y
        }
    });

}