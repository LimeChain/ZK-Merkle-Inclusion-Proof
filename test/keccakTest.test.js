const chai = require("chai")
const ethers = require("ethers");
const assert = chai.assert;
const wasm_tester = require("circom_tester").wasm;
const utils = require("./utils");

describe("Keccak 32bytes full hash test", function () {
    this.timeout(100000);

    let cir;
    before(async () => {
        cir = await wasm_tester("src/circuits/KeccakTest.circom");
        await cir.loadConstraints();
        console.log("n_constraints", cir.constraints.length);
    });

    it ("Keccak test 1", async () => {

		// expected in
		const bytes32hex = ethers.utils.formatBytes32String("hello");
		console.log('bytes32hex', bytes32hex)

		// const strHex =  ethers.utils.hexlify(bytes32hex)
		// console.log(strHex)

		const strByteArray = ethers.utils.arrayify(bytes32hex)
		console.log('strByteArray', strByteArray)

		const input = strByteArray;

		// expected out
		const expectedKeccacked = ethers.utils.keccak256(bytes32hex)
		console.log('expectedKeccacked', expectedKeccacked)

		// const expectedOutBytes = ethers.utils.arrayify(expectedKeccacked);
		// console.log('expectedOutBytes', expectedOutBytes)

		console.log("bytesToBits")
		const inIn = utils.bytesToBits(input);
		console.log("inIn", inIn)

		console.log("calculateWitness")
		const witness = await cir.calculateWitness({ "in": inIn }, true);

		console.log("bitsToBytes")
		const circomOut = witness.slice(1, 1+(32*8));
		console.log("stateOut", circomOut)

		const circomOutBytes = utils.bitsToBytes(circomOut);
		const circomKeccacked = ethers.utils.hexlify(circomOutBytes);

		console.log('circomKeccacked', circomKeccacked)
		console.log('expectedKeccacked', expectedKeccacked);
		assert.equal(circomKeccacked, expectedKeccacked);
    });

});
