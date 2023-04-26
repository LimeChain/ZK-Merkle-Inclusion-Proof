const hre = require("hardhat");

async function main() {
  const MerkleProof = await hre.ethers.getContractFactory("MerkleProof");
  const merkleProof = await MerkleProof.deploy();
  await merkleProof.deployed();

  console.log(merkleProof.address);

  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
