pragma circom 2.0.0;

include "../keccak.circom";
include "../Num2Bits.circom";
include "../Concat2Arrays.circom";

template RestoreMerkleRoot(proofLength, index, nBits) {
    // public
    signal input leaf;
    signal input root;

    // private
    signal input proof[proofLength][nBits];

    // out
    signal output out[nBits];

    // prepare data
    // leaf
    component leafBitsConverter = Num2Bits(nBits);
    leafBitsConverter.in <== leaf;
    signal leafBits[nBits] <== leafBitsConverter.out;

    // restore the root
    component hasher[proofLength];
    component concater[proofLength];
    var hash[nBits] = leafBits;

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

    component bits2num = Bits2Num(nBits);
    bits2num.in <== hash;
    bits2num.out === root;
}

component main {public [leaf, root]} = RestoreMerkleRoot(3, 2, 32*8);