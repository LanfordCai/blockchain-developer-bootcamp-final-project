## HODL!

HODL! is the name of my final project, and this repository contains two projects:

1. hodl: the contract of HODL!
2. hodl-fe: the front-end code of HODL!

### Project Demo

TODO: 

### Project Description

#### About HODL!

HODL is a slogan of many token/coin holders in the cryptocurrency market, and it is proved to be one of the best market strategies. But there are not that many HODLers, in fact. Many people are defeated by human nature and feel regret when the token/coin pump.

HODL! is aiming to provide a tool for users to lock their ERC20 tokens for a specific time. When the tokens are locked, a penalty ratio would be set. If the user wants to force-redeem before the lock is expired, a part of the token locked would be taken as a penalty. If the users do HODL the tokens until the lock is expired, they can claim an ERC721 NFT. The NFT is a certificate for REAL HODLER, and the NFT hodlers have some privileges like sharing the penalty, governing the protocol, etc.

#### User Workflow

For now, HODL only supports TestCoin(TC), which is issued for testing. 

1. Connect: Connect Wallet by clicking the 'Connect Wallet' button
2. Faucet: Claim 100 TC by clicking the 'Faucet' button
3. Create Vault: Input the amount of TC the user wants to lock, choose the period of lock, and set the penalty ratio. By clicking the 'Create Vault' button, the token would be transferred to the HODL! and locked there.
4. Redeem: If the lock is expired, users can redeem their token in full.
5. Force Redeem: If the lock isn't expired, users can force redeem their token, but some tokens will be taken as a penalty.
6. Claim: If users keep waiting until the expiration of the lock, they can claim the HODL NFT after redeeming their funds.


#### Tech Stack and Toolings

1. Smart contract development based on OpenZeppelin ERC-20, ERC-721
2. Using HardHat framework for smart contract development and testing
3. Using create-react-app and web3-react(with ethersjs) for frontend interaction

### Project Installation

TODO: 
