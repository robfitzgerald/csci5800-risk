'use strict';

{
    var generateRandomState = require(__dirname + '/generateRandomState.helper')
        , stateToVector = require(__dirname + '/stateToVector.helper')
        , clips = require(__dirname + '/clips.middleware')
        , outerProduct = require(__dirname + '/outerProduct.helper')
        , v = require('vectorious')
        , Matrix = v.Matrix
        , Vector = v.Vector;

    // Create W and W2
    var hiddenLayerSize = 5000;
    var W = Matrix.random(33, hiddenLayerSize, 0.01);
    var W2 = Matrix.random(hiddenLayerSize, 2, 0.01);

    var stepSize = 0.01;
    var lamda = 0.1;

    for (var iterations = 0; iterations < 1000; ++iterations) {
        var state = generateRandomState();
        var y = clips(state);
        var x = stateToVector(state);

        // Multiply input by the first layer
        var hidden = Matrix.multiply(x, W);

        // Apply the ReLU
        var hiddenReLU = hidden.map(x => (x < 0) ? 0 : x);

        // Multiply hidden input to hidden layer
        var preSoftMax = Matrix.multiply(hiddenReLU, W2);

        // Apply softmax
        var denom = 0.0;
        preSoftMax.each( (x, i, j) => {
            denom += Math.exp(x);
        });

        var out = preSoftMax.map(x => Math.exp(x)/denom);


        // Calculate loss
        var loss = 0.0;
        W.each( (x, i, j) => {
            loss += x*x;
        });
        W2.each( (x, i, j) => {
            loss += x*x;
        });
        loss *= lamda*0.5;
        loss += -Math.log(out.get(0, y));

        if ((iterations % 10) === 0)
            console.log('Loss: ' + loss);

        // Apply gradient descent
        var dOut = Vector.zeros(2);
        dOut.set(y, 1);
        dOut.subtract(out);

        var dW2 = outerProduct(hiddenReLU.toArray()[0], dOut.toArray());
        dW2.scale(stepSize);
        W2.add(dW2);

        var dHidden = Matrix.multiply(new Matrix([dOut.toArray()]), W2.transpose());
        dHidden.each( (x, i, j) => {
            if (hidden.get(i, j) < 0) {
                x = 0;
            }
        });

        var dW = outerProduct(x.toArray()[0], dHidden.toArray()[0]);
        dW.scale(stepSize);
        W.add(dW);
    }

}