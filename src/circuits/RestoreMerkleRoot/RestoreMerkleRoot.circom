pragma circom 2.0.0;

include "../keccak.circom";
include "../Concat2Arrays.circom";

template RestoreMerkleRoot(proofLength, index, nBits) {
    signal input leaf[nBits];
    signal input proof[proofLength][nBits];
    signal output out[nBits];

    component hasher[proofLength];
    component concater[proofLength];
    
    var hash[nBits] = leaf;

    for (var i = 0; i < proofLength; i++) {
        hasher[i] = Keccak(nBits*2, nBits);
        concater[i] = Concat2Arrays(nBits);

        if (index % 2 == 0) {
            concater[i].arr1 <== hash;
            concater[i].arr2 <== proof[i];
        }
        else {
            concater[i].arr1 <== proof[i];
            concater[i].arr2 <== hash;
        }

        hasher[i].in <== concater[i].out;
        hash = hasher[i].out;

        index = index > 1 ? index / 2 : 0;
    }

    out <== hash;
}

component main {public [leaf, proof]} = RestoreMerkleRoot(3, 2, 32*8);