## HODL!

HODL! is the name of my final project, and this repository contains two projects:

1. hodl: the contract project
2. hodl-fe: the front-end project

### My Ethereum Address

lanford33.eth or 0xB8153Ae427265daa3d1C8704698b2Cf66F59c4C5

### Project Demo

The project has been deployed to **Rinkeby** Testnet

Demo: https://ohmycoin.today/

Screencast: https://www.loom.com/share/2a935f8ff6b74303b9e6f3ea05ffe4ef

### Project Description

#### About HODL!

HODL is a slogan of many token/coin holders in the cryptocurrency market, and it is proved to be one of the best market strategies. But there are not that many HODLers, in fact. Many people are defeated by human nature and feel regret when the token/coin pump.

HODL! is aiming to provide a tool for users to lock their ERC20 tokens for a specific time. When the tokens are locked, a penalty ratio would be set. If the user wants to force-redeem before the lock is expired, a part of the token locked would be taken as a penalty. If the users do HODL the tokens until the lock is expired, they can claim an ERC721 NFT. The NFT is a certificate for REAL HODLER, and the NFT hodlers have some privileges like sharing the penalty, governing the protocol, etc.

#### User Workflow

For now, HODL only supports TestCoin(TC), which is issued for testing. 

0. Visit: https://ohmycoin.today/
1. Connect: Connect with Metamask by clicking the 'Connect Wallet' button
2. Faucet: Claim 100 TC for testing by clicking the 'Faucet' button
3. Approve Testcoin: Approve HodlVault to transfer your TestCoin
4. Create Vault: Input the amount of TC the user wants to lock, choose the period of lock, and set the penalty ratio. By clicking the 'Create Vault' button, the token would be transferred to the HODL! and be locked. For now, each address can create ten vaults at most.
5. Redeem: If the lock is expired, users can redeem their token in full.
6. Force Redeem: If the lock isn't expired, users can force redeem their token, but some tokens will be taken as a penalty.
7. Claim: If users keep waiting until the expiration of the lock, they can claim the HODL NFT after redeeming their funds. The NFT is a fully on-chain SVG NFT, and you can check it in Rarible or OpenSea, or some other markets.

#### Directory structure

1. hodl: the contract project of HODL!
    * contracts: the smart contracts
    * scripts: scripts for hardhat to do deployment and some other tasks
    * test: smart contract unit tests
2. hodl-fe: the front-end project of HODL!
    * public: entrance of the project
    * src: javascript/css files and smart contract abi files


#### Tech Stack and Toolings

1. Smart contract development based on OpenZeppelin ERC-20, ERC-721
2. Using HardHat framework for smart contract development and testing
3. Using create-react-app and web3-react(with ethersjs) for frontend interaction

### Project Installation

#### prerequisite

```
node >= v14.18.0
npm >= 6.14.15
hardhat >= 2.2.1
yarn >= 1.22.10
```

#### Installation

```bash
git clone https://github.com/LanfordCai/blockchain-developer-bootcamp-final-project.git

cd blockchain-developer-bootcamp-final-project
```

For the smart contract part:

```bash
cd hodl
npm install

export ALCHEMY_API_KEY='YOUR_ALCHEMY_API_KEY'
export DEPLOYER_PRIVATE_KEY='YOUR_DEPLOYER_PRIVATE_KEY'

hh compile
hh test

hh run --network rinkeby scripts/testcoin_deployer.js
hh run --network rinkeby scripts/diamondhand_deployer.js

// modify `testCoinContract` and `diamondHandContract` in hodlvault_deployer.js according to the deploy result above and then:
hh run --network rinkeby scripts/hodlvault_deployer.js
```

For the front-end part:

```bash
cd hodl-fe
yarn install

export REACT_APP_TESTCOIN_CONTRACT='YOUR_TESTCOIN_CONTRACT_ADDRESS'
export REACT_APP_HODL_CONTRACT='YOUR_HODLVAULT_CONTRACT_ADDRESS'

yarn start
// visit http://localhost:3000
```

### Future features

* Allow lock customize ERC20 token
* Allow lock ERC721/ERC1155 token
* Create a pool for NFT hodlers to share the penalty the protocol received.


