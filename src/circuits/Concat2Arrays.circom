pragma circom 2.0.0;

include "./keccak.circom";

template Concat2Arrays(inputArraysLength) {
    signal input arr1[inputArraysLength];
    signal input arr2[inputArraysLength];
    signal output out[inputArraysLength * 2];

    for (var i = 0; i < inputArraysLength; i++) {
        out[i] <== arr1[i];
    }

    for (var i = 0; i < inputArraysLength; i++) {
        out[inputArraysLength + i] <== arr2[i];
    }
}