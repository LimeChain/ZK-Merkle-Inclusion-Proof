require("@nomicfoundation/hardhat-toolbox");
require("hardhat-circom");
const fs = require("fs/promises");
const TASK_CIRCOM_TEMPLATE = require("hardhat-circom");
const TASK_COMPILE = require("hardhat/builtin-tasks/task-names");
require("hardhat/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  circom: {
    inputBasePath: "../circuits",
    ptau: "powersOfTau28_hez_final_19.ptau",
    circuits: [
      {
        // (required) The name of the circuit
        name: "RestoreMerkleRoot",
        // (optional) The circom version used to compile circuits (1 or 2), defaults to 2
        version: 2,
        // (optional) Protocol used to build circuits ("groth16" or "plonk"), defaults to "groth16"
        protocol: "groth16",
        // (optional) Input path for circuit file, inferred from `name` if unspecified
        circuit: "RestoreMerkleRoot/RestoreMerkleRoot.circom",
        // (optional) Input path for witness input file, inferred from `name` if unspecified
        input: "RestoreMerkleRoot/input.json",
        // (optional) Output path for wasm file, inferred from `name` if unspecified
        wasm: "RestoreMerkleRoot/witness_hardhat.wasm",
        // (optional) Output path for zkey file, inferred from `name` if unspecified
        zkey: "RestoreMerkleRoot/RestoreMerkleRoot_hardhat.zkey",
        // Used when specifying `--deterministic` instead of the default of all 0s
        // beacon: "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
      }
    ],
  }
};

task(TASK_COMPILE, "hook compile task to include circuit compile and template").setAction(circuitsCompile);

async function circuitsCompile(args, hre, runSuper) {
  await hre.run(TASK_CIRCOM, args);
  await runSuper();
}

subtask(TASK_CIRCOM_TEMPLATE, "generate Verifier template shipped by SnarkjS").setAction(circomTemplate);

async function circomTemplate({ zkeys }, hre) {
  const myGroth16Template = await fs.readSync(path.resolve("./my_verifier_groth16.sol"), "utf8");
  const myPlonkTemplate = await fs.readSync(path.resolve("./my_verifier_plonk.sol"), "utf8");

  let combinedVerifier = "";
  for (const zkey of zkeys) {
    const verifierSol = await hre.snarkjs.zKey.exportSolidityVerifier(zkey, {
      groth16: myGroth16Template,
      plonk: myPlonkTemplate,
    });

    combinedVerifier += verifierSol;
  }

  const verifierPath = path.join(hre.config.paths.sources, "Verifier.sol");
  await fs.writeFile(verifierPath, combinedVerifier);
}