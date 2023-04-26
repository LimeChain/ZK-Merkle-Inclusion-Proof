const ethers = require("ethers");
const wasm_tester = require("circom_tester").wasm;
const utils = require("./utils");

describe("Concat 2 Arrays tests", function () {
    this.timeout(100000);

    let cir;
    before(async () => {
        cir = await wasm_tester("src/circuits/Concat2Arrays.circom");
        await cir.loadConstraints();
        console.log("n_constraints", cir.constraints.length);
    });

    it ("Concat test 1", async () => {
      
      console.log("calculateWitness")
      const witness = await cir.calculateWitness({ "arr1": [1,2,3], "arr2": [4,5,6] }, true);

      console.log("circomOut ...")
      const circomOut = witness.slice(1, 1 + (3*2));
      console.log("circomOut", circomOut)

      const circomOutBytes = utils.bitsToBytes(circomOut);
      const circomHexed = ethers.utils.hexlify(circomOutBytes);

      console.log('circomOutBytes', circomOutBytes)
      console.log('circomHexed', circomHexed);
    });
});
