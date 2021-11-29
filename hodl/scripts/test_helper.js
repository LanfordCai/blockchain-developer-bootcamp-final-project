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
  const diamondHandContract = "0x9FF189a87578801EF9a38C6b6e4E5449F78FF5cD";
  const vaultContract = "0xde75D0f0FB7d56F311fA4834627277377AbcD341"

  const DiamondHand = await ethers.getContractFactory("DiamondHand");
  const diamondHand = await DiamondHand.attach(diamondHandContract);

  const TestCoin = await ethers.getContractFactory("TestCoin");
  const testcoin = await TestCoin.attach(testCoinContract);

  const Vault = await ethers.getContractFactory("HodlVault");
  const vault = await Vault.attach(vaultContract);

  // let tx = await testcoin.approve(vault.address, ethers.constants.MaxUint256)
  // console.log(`approve tx created! txid: ${tx['hash']}`);
  // await tx.wait()

  // const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
  // const lockWindow = 100000000;
  // const penalty = 20;
  // tx = await vault.lock(amount, lockWindow, penalty);
  // console.log(`lock tx created! txid: ${tx['hash']}`);
  // await tx.wait()

  // let tx = await vault.forceRedeem(1)
  // console.log(`redeem tx created! txid: ${tx['hash']}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
