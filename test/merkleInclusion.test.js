const chai = require("chai")
const ethers = require("ethers");
const assert = chai.assert;
const wasm_tester = require("circom_tester").wasm;
const utils = require("./utils");
const keccak256 = require("keccak256");
const merkle = require("merkletreejs");
const fs = require("fs");

describe("Restore Merkle Root tests", function () {
    this.timeout(100000);

    let cir;
    before(async () => {
        cir = await wasm_tester("src/circuits/RestoreMerkleRoot.circom");
        await cir.loadConstraints();
        console.log("n_constraints", cir.constraints.length);
    });

    it.only ("Merkle Inclusion 1", async () => {

		// generate tree
		const treeElementsNum = 8;
		const treeElements = [];
		for (let i = 0; i < treeElementsNum; i++) {
			const str = "hello" + i;
			const hex = ethers.utils.formatBytes32String(str);
			treeElements[i] = ethers.utils.keccak256(hex);
		}
		console.log(treeElements.map((val, idx) => { return val + " " + "hello" + idx }))
		
		const tree = new merkle.MerkleTree(treeElements, keccak256); console.log('tree', tree.toString());
		const root = tree.getRoot().toString('hex'); console.log('root', root);

		// get leaf
		const leafIndex = 2;
		const leaf = treeElements[leafIndex]; console.log('leaf', leaf.toString());
		const leafBytes = ethers.utils.arrayify(leaf); console.log('leafBytes', leafBytes);
		const leafBits = utils.bytesToBits(leafBytes); console.log('leafBits', leafBits);

		// get proof
		const proof = tree.getProof(leaf); console.log('proof', proof);
		const proofBits = proof.map(i => utils.bytesToBits((i.data))); console.log('proofBits', proofBits);

		// export input params
		const inputJson = JSON.stringify({ leaf: leafBits, proof: proofBits});
		fs.writeFileSync("src/circuits/RestoreMerkleRoot/input.json", inputJson);

		// calculate witness
		const witness = await cir.calculateWitness({ "leaf": leafBits, "proof": proofBits }, true);
		const witnessBits = witness.slice(1, 1 + (32*8));
		const witnessBytes = utils.bitsToBytes(witnessBits);
		const witnessHex = ethers.utils.hexlify(witnessBytes);

		console.log('witnessHex', witnessHex)
		console.log('expectedRoot', "0x" + root);
		assert.equal(witnessHex, "0x" + root);
    });

});
