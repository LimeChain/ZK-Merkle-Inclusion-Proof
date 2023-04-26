pragma circom 2.0.0;

include "./keccak.circom";

template KeccakTest(nBitsIn, nBitsOut) {
    signal input in;
    signal output out;

    component num2bit = Num2Bits(nBitsIn);
    num2bit.in <== in;

    component kecc = Keccak(nBitsIn, nBitsOut);
    kecc.in <== num2bit.out;

    component bit2num = Bits2Num(nBitsIn);
    bit2num.in <== kecc.out;

    out <== bit2num.out;
}