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
  await testCoin.connect(addr2).faucet();
  expect(await testCoin.balanceOf(owner.address)).to.equal(`${100 * 10 ** 18}`)

  DiamondHand = await ethers.getContractFactory("DiamondHand");
  diamondHand = await DiamondHand.deploy();

  Vault = await ethers.getContractFactory("HodlVault");
  vault = await Vault.deploy(testCoin.address, diamondHand.address);
  await vault.deployed();

  await vault.setPenaltyReceiver(addr1.address);
  expect(await vault.penaltyReceiver()).to.equal(addr1.address);

  await testCoin.connect(owner).approve(vault.address, ethers.constants.MaxUint256)
  await testCoin.connect(addr2).approve(vault.address, ethers.constants.MaxUint256)
  await diamondHand.grantRole(await diamondHand.MINTER(), vault.address);
});

describe("lock", function () {
  it("Should create lock with valid params", async function () {
    const time = Math.floor(Date.now() / 1000) + 100;
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);

    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await expect(vault.connect(owner).lock(amount, lockWindow, penalty))
      .to.emit(vault, 'LockCreated');

    const lock = await vault.locks(owner.address, 0)
    expect(lock.amount.eq(amount));
    expect(lock.lockWindow.eq(ethers.BigNumber.from(lockWindow)));
    expect(lock.penalty.eq(ethers.BigNumber.from(penalty)));
    // Active
    expect(lock.status == 0)
    expect(lock.unlockTime.eq(ethers.BigNumber.from(time + lockWindow)))

    expect(lock.lockAt.eq(time))
    expect(lock.redeemAt.isZero())
    expect(lock.claimAt.isZero())

    expect(await vault.lockCount(owner.address)).to.equal(1)

    expect(await testCoin.balanceOf(owner.address)).eq(`${90 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${10 * 10 ** 18}`)
  });

  it("Should revert with invalid params", async function () {
    await expect(vault.connect(owner).lock(0, 1000, 20)).to.be.revertedWith('Amount should > 0');
    await expect(vault.connect(owner).lock(10, 0, 20)).to.be.revertedWith('lockWindow should greater than 0 and smaller than maxLockWindow');
    await expect(vault.connect(owner).lock(10, 100000000000, 20)).to.be.revertedWith('lockWindow should greater than 0 and smaller than maxLockWindow');
    await expect(vault.connect(owner).lock(10, 1000, 200)).to.be.revertedWith('penalty ratio should in range 0..100');
  });

  it("locks per user should not exceed maxLocksPerUser", async function () {
    await vault.connect(owner).setMaxLocksPerUser(2);
    expect(await vault.maxLocksPerUser()).to.equal(2);

    await vault.connect(owner).lock(10, 1000, 20);
    await vault.connect(owner).lock(10, 1000, 20);
    await expect(vault.connect(owner).lock(20, 1000, 20)).to.be.revertedWith('Lock number limit exceed');

    expect(await vault.lockCount(owner.address)).to.equal(2)
  })
});

describe("redeem", function () {
  it("Should success if the lock expires", async function () {
    const time = Math.floor(Date.now() / 1000) + 200;
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await vault.connect(owner).lock(amount, lockWindow, penalty)

    expect(await testCoin.balanceOf(owner.address)).eq(`${90 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${10 * 10 ** 18}`)

    await ethers.provider.send('evm_setNextBlockTimestamp', [time + lockWindow]);
    await ethers.provider.send('evm_mine');

    await expect(vault.connect(owner).redeem(0)).to.emit(vault, 'Redeemed');

    expect(await testCoin.balanceOf(owner.address)).eq(`${100 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${0}`)

    const lock = await vault.locks(owner.address, 0);
    // Redeemed
    expect(lock.status == 1)
    expect(lock.redeemAt.eq(time + lockWindow))

    // Can only redeem once
    await expect(vault.connect(owner).redeem(0)).to.be.revertedWith("Invalid lock status");
  })

  it("Should be reverted if the lock isn't expired", async function () {
    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await vault.connect(owner).lock(amount, lockWindow, penalty)

    await expect(vault.connect(owner).redeem(0)).to.be.revertedWith("Can't redeem now");
  })
})

describe("forceRedeem", function () {
  it("Should behave like `redeem` if the lock expires", async function () {
    const time = Math.floor(Date.now() / 1000) + 3000;
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await vault.connect(owner).lock(amount, lockWindow, penalty)

    expect(await testCoin.balanceOf(owner.address)).eq(`${90 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${10 * 10 ** 18}`)

    await ethers.provider.send('evm_setNextBlockTimestamp', [time + lockWindow]);
    await ethers.provider.send('evm_mine');

    // emit `Redeemed` rather than `ForceRedeemed`
    await expect(vault.connect(owner).forceRedeem(0)).to.emit(vault, 'Redeemed');

    expect(await testCoin.balanceOf(owner.address)).eq(`${100 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${0}`)

    const lock = await vault.locks(owner.address, 0);
    // the status of lock should be `Redeemed` rather than `ForceRedeemed`
    expect(lock.status == 1)
    expect(lock.redeemAt.eq(time + lockWindow))

    // Can only redeem once
    await expect(vault.connect(owner).forceRedeem(0)).to.be.revertedWith("Invalid lock status");
  })

  it("Should be success with penalty if the lock isn't expired", async function () {
    const time = Math.floor(Date.now() / 1000) + 5000;
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);

    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await vault.connect(owner).lock(amount, lockWindow, penalty)

    expect(await testCoin.balanceOf(owner.address)).eq(`${90 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${10 * 10 ** 18}`)

    await expect(vault.connect(owner).forceRedeem(0)).to.emit(vault, 'ForceRedeemed');

    expect(await testCoin.balanceOf(owner.address)).eq(`${98 * 10 ** 18}`)
    expect(await testCoin.balanceOf(vault.address)).eq(`${0}`)
    // 10 * 20% = 2
    expect(await testCoin.balanceOf(addr1.address)).eq(`${2 * 10 ** 18}`)

    const lock = await vault.locks(owner.address, 0);
    // ForceRedeemed
    expect(lock.status == 2)
    expect(lock.redeemAt.eq(time))

    // Can only forceRedeem once
    await expect(vault.connect(owner).forceRedeem(0)).to.be.revertedWith("Invalid lock status");
  })
})

describe("Claim", function () {
  it("Only redeemed lock can claim NFT", async function () {
    const time = Math.floor(Date.now() / 1000) + 6000;
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);

    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await vault.connect(owner).lock(amount, lockWindow, penalty)
    await vault.connect(owner).lock(amount, lockWindow + 10000, penalty)
    await vault.connect(owner).lock(amount, lockWindow + 20000, penalty)

    await ethers.provider.send('evm_setNextBlockTimestamp', [time + lockWindow]);
    await ethers.provider.send('evm_mine');

    await expect(vault.connect(owner).redeem(0)).to.emit(vault, 'Redeemed');
    await expect(vault.connect(owner).forceRedeem(1)).to.emit(vault, 'ForceRedeemed');

    await expect(vault.connect(owner).claim(0)).to.emit(vault, 'Claimed');
    await expect(vault.connect(owner).claim(1)).to.be.revertedWith('Lock should in Redeemed status');
    await expect(vault.connect(owner).claim(2)).to.be.revertedWith('Lock should in Redeemed status');

    const lock = await vault.locks(owner.address, 0);
    // Claimed
    expect(lock.status == 3)
    expect(lock.claimAt.eq(time + lockWindow))
  })

  it("Should get valid ERC721 token", async function () {
    const time = Math.floor(Date.now() / 1000) + 10000;
    await ethers.provider.send('evm_setNextBlockTimestamp', [time]);

    const amount = ethers.BigNumber.from(`${10 * 10 ** 18}`);
    const lockWindow = 1000;
    const penalty = 20;
    await vault.connect(owner).lock(amount, lockWindow, penalty)

    const amount2 = amount.add(1000)
    const penalty2 = 30
    await vault.connect(addr2).lock(amount2, lockWindow, penalty2)

    await ethers.provider.send('evm_setNextBlockTimestamp', [time + lockWindow]);
    await ethers.provider.send('evm_mine');

    await expect(vault.connect(owner).redeem(0)).to.emit(vault, 'Redeemed');
    await expect(vault.connect(owner).claim(0)).to.emit(vault, 'Claimed');

    expect(await diamondHand.balanceOf(owner.address)).to.equal(1)
    const info = await diamondHand.tokenInfo(0)

    expect(info.token == testCoin.address)
    expect(info.amount.eq(amount))
    expect(info.lockAt.eq(time))
    expect(info.unlockAt.eq(time + lockWindow))
    expect(info.penaltyRatio.eq(penalty))

    await expect(vault.connect(addr2).redeem(0)).to.emit(vault, 'Redeemed');
    await expect(vault.connect(addr2).claim(0)).to.emit(vault, 'Claimed');

    expect(await diamondHand.balanceOf(addr2.address)).to.equal(1)
    const info2 = await diamondHand.tokenInfo(1)

    expect(info2.token == testCoin.address)
    expect(info2.amount.eq(amount2))
    expect(info2.lockAt.eq(time))
    expect(info2.unlockAt.eq(time + lockWindow))
    expect(info2.penaltyRatio.eq(penalty2))
  })
})

