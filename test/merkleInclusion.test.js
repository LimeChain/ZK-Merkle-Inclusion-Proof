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
        cir = await wasm_tester("src/circuits/RestoreMerkleRoot/RestoreMerkleRoot.circom");
        await cir.loadConstraints();
        console.log("n_constraints", cir.constraints.length);
    });

    it.only ("Merkle Inclusion 1", async () => {

		// generate tree
		const treeElementsNum = 8;
		const treeElements = [];
		for (let i = 0; i < treeElementsNum; i++) {
			const elementValue = i;
			const hex = ethers.utils.formatBytes32String(elementValue);
			treeElements[i] = ethers.utils.keccak256(hex);
		}
		console.log(treeElements.map((val, idx) => { return val + " " + idx }))
		
		const tree = new merkle.MerkleTree(treeElements, keccak256); console.log('tree', tree.toString());
		const rootBytes = tree.getRoot(); console.log('rootBytes', rootBytes);
		const rootHex = rootBytes.toString('hex'); console.log('rootHex', rootHex);
		const rootBigInt = ethers.BigNumber.from("0x" + rootHex).toString(); console.log('rootBigInt', rootBigInt);

		// get leaf
		const leafIndex = 2;
		const leaf = treeElements[leafIndex]; console.log('leaf', leaf.toString());
		const leafBigInt = ethers.BigNumber.from(leaf).toString(); console.log('leafBigInt', leafBigInt);

		// get proof
		const proof = tree.getProof(leaf); console.log('proof', proof);
		const proofBits = proof.map(i => utils.bytesToBits((i.data))); console.log('proofBits', proofBits);

		// calculate witness
		const circomParams = { "leaf": leafBigInt, "root": rootBigInt, "proof": proofBits};
		await cir.calculateWitness(circomParams, true);

		// export input params
		// const inputJson = JSON.stringify(circomParams);
		// fs.writeFileSync("src/circuits/RestoreMerkleRoot/input.json", inputJson);
    });
});