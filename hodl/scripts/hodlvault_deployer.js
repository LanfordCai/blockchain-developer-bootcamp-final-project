// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const testCoinContract = "0x91C538676eA5ca642fCcC386eAa8f0F7abcB3c2f";
  const diamondHandContract = "0x4054AE8D703767fb9CD8a31e857397E2db513A55";

  const DiamondHand = await ethers.getContractFactory("DiamondHand");
  const diamondHand = await DiamondHand.attach(diamondHandContract);

  Vault = await ethers.getContractFactory("HodlVault");
  vault = await Vault.deploy(testCoinContract, diamondHandContract);

  await vault.deployed();
  console.log("HodlVault deployed to:", vault.address);

  await diamondHand.grantRole(await diamondHand.MINTER(), vault.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
