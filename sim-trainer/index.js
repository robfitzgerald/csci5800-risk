'use strict';

{
    var generateRandomState = require(__dirname + '/generateRandomState.helper')
        , stateToVector = require(__dirname + '/stateToVector.helper')
        , clips = require(__dirname + '/clips.middleware')
        , outerProduct = require(__dirname + '/outerProduct.helper')
        , v = require('vectorious')
        , fs = require('fs')
        , Matrix = v.Matrix
        , Vector = v.Vector;

    // Create W and W2
    var hiddenLayerSize = 5200;
    var W = Matrix.random(33, hiddenLayerSize, 0.01);
    var W2 = Matrix.random(hiddenLayerSize, 2, 0.01);

    var stepSize = 0.0001;
    var lamda = 0.00001;
    var batchSize = 300;

    for (var iterations = 0; iterations < 100000; ++iterations) {
        // Generate a single batch
        var xArray = [];
        var yArray = [];
        for (var i = 0; i < batchSize; ++i) {
            var state = generateRandomState();
            yArray.push(clips(state));
            xArray.push(stateToVector(state));
        }

        var X = new Matrix(xArray);
        var Y = new Matrix([yArray]);

        // Multiply input by the first layer
        var hidden = Matrix.multiply(X, W);

        // Apply the ReLU
        var hiddenReLU = hidden.map(x => (x < 0) ? 0 : x);

        // Multiply hidden input to hidden layer
        var preSoftMax = Matrix.multiply(hiddenReLU, W2);

        // Apply softmax
        var denom = [];
        preSoftMax.each( (x, i, j) => {
            if (j == 0) {
                denom[i] = 0.0;
            }

            denom[i] += Math.exp(x);
        });

        var out = [];
        preSoftMax.each( (x, i, j) => {
            if (j == 0) {
                out[i] = [];
            }

            out[i][j] = Math.exp(x)/denom[i];
        });

        // Calculate loss
        var regLoss = 0.0;
        W.each( (x, i, j) => {
            regLoss += x*x;
        });
        W2.each( (x, i, j) => {
            regLoss += x*x;
        });
        regLoss *= lamda*0.5;

        var loss = 0.0;
        new Matrix(out).each( (x, i, j) => {
            loss += -Math.log(out[i][Y.get(0, i)])
        });
        loss /= batchSize;

        // Calculate percent correct
        var totalCorrect = 0;
        for (var i = 0; i < batchSize; ++i) {
            var index = out[i].indexOf(Math.max(...out[i]));

            if (index === Y.get(0, i)) {
                ++totalCorrect;
            }
        }

        console.log('Iterations: ' + (iterations+1)*batchSize);
        console.log('Percent Correct: ' + (totalCorrect / batchSize) * 100);
        console.log('Loss: ' + loss);

        // Apply gradient descent
        var dOut = Matrix.zeros(2, batchSize);
        for (var i = 0; i < batchSize; ++i) {
            dOut.set(Y.get(0, i), i, 1);
        }
        dOut.subtract(new Matrix(out));

        var dOutSum = [0.0, 0.0];
        for (var i = 0; i < batchSize; ++i) {
            for (var j = 0; j < 2; ++j) {
                dOutSum[j] += dOut.get(j, i);
            }
        }
        dOutSum[0] /= batchSize;
        dOutSum[1] /= batchSize;

        var dW2 = outerProduct(hiddenReLU.toArray()[0], dOutSum);
        dW2.scale(stepSize);
        W2.add(dW2);

        var dHidden = Matrix.multiply(dOut.transpose(), W2.transpose());
        dHidden.each( (x, i, j) => {
            if (hidden.get(i, j) < 0) {
                dHidden.set(i, j, 0);
            }
        });

        var tempdW = [];

        for (var i = 0; i < batchSize; ++i) {
            tempdW[i] = outerProduct(X.toArray()[i], dHidden.toArray()[i]);
        }

        var dW;
        for (var i = 0; i < batchSize; ++i) {
            if (i === 0) {
                dW = new Matrix(tempdW[0].toArray());
            } else {
                tempdW[i].each( (x, i, j) => {
                    dW.set(i, j, dW.get(i, j) + x);
                });
            }
        }

        dW.scale(stepSize);
        W.add(dW);
    }

    console.log('Saving W to file');

    var WFile = fs.createWriteStream('W.txt');
    WFile.on('error', err => { 
        console.log(W.toArray());
    });
    W.toArray().forEach( v => {
        WFile.write(v.join(', ') + '\n');
    });
    WFile.end();

    console.log('Saving W2 to file');

    var W2File = fs.createWriteStream('W2.txt');
    W2File.on('error', err => { 
        console.log(W2.toArray());
    });
    W2.toArray().forEach( v => {
        W2File.write(v.join(', ') + '\n');
    });
    W2File.end();

}