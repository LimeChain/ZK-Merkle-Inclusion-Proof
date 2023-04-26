pragma circom 2.1.4;

template Multiplier() {
    signal input a;
    signal input b;
    signal output c;
    c <== a*b;
}

component main = Multiplier();