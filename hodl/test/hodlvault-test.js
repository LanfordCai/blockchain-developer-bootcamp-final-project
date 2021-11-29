const { expect } = require("chai");
const { ethers } = require("hardhat");

let TestCoin;
let testCoin;

let DiamondHand;
let diamondHand;

let Vault;
let vault;

let owner;
let addr1;
let addr2;
let addrs;

beforeEach(async function () {
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  TestCoin = await ethers.getContractFactory("TestCoin");
  testCoin = await TestCoin.deploy(`0`);

  await testCoin.connect(owner).faucet();
  expect(await testCoin.balanceOf(owner.address)).to.equal(`${100 * 10 ** 18}`)

  DiamondHand = await ethers.getContractFactory("DiamondHand");
  diamondHand = await DiamondHand.deploy();

  Vault = await ethers.getContractFactory("HodlVault");
  vault = await Vault.deploy(testCoin.address, diamondHand.address);
  await vault.deployed();

  await testCoin.connect(owner).approve(vault.address, ethers.constants.MaxUint256)
});

describe("HodlVault-lock", function () {
  it("Should create lock with valid params", async function () {
    const time = Math.floor(Date.now() / 1000) + 100;
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);

    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await expect(vault.connect(owner).lock(amount, lockWindow, penalty))
      .to.emit(vault, 'LockCreated');

    const lock = await vault.locks(owner.address);
    expect(lock.amount.eq(amount));
    expect(lock.lockWindow.eq(ethers.BigNumber.from(lockWindow)));
    expect(lock.penalty.eq(ethers.BigNumber.from(penalty)));
    expect(lock.status == 0)
    expect(lock.unlockTime.eq(ethers.BigNumber.from(time + lockWindow)))

    expect(await testCoin.balanceOf(owner.address)).eq(`${90 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${10 * 10 ** 18}`)
  });

  it("Should revert with invalid params", async function () {
    await expect(vault.connect(owner).lock(0, 1000, 20)).to.be.revertedWith('Amount should > 0');
    await expect(vault.connect(owner).lock(10, 0, 20)).to.be.revertedWith('lockWindow should > 0');
    await expect(vault.connect(owner).lock(10, 1000, 200)).to.be.revertedWith('penalty ratio should in range 0..100');
  });

  it("Only 1 vault can be created for 1 user", async function () {
    await vault.connect(owner).lock(10, 1000, 20);
    await expect(vault.connect(owner).lock(20, 1000, 20)).to.be.revertedWith('Lock already exists');
  })
});

