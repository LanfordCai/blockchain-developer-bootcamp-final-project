## Applied Design Patterns

### Inter-Contract Execution

- The `HodlVault` smart contract contain functions which execute the `TestCoin` and `DiamondHand` smart contracts to transact/mint the ERC20 and ERC721 tokens

### Inheritance and Interfaces

- Most smart contracts in this project inherit from one or more smart contracts from `OpenZeppelin` smart contract library.
- `HodlVault` inherit `IHodlVault`

### Access Control Design Patterns

- The `DiamondHand` smart contract extend `Accesscontrol` from `OpenZeppelin` library to control the permission for `mint` function.
- the `HodlVault` smart contract also adopt the `Ownable` from the library to control the access of `setPenaltyReceiver`/`setMaxLockWindow` functions.