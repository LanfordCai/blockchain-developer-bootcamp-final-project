## Avoided Common Attacts

### Using Specific Compiler Pragma

- Lock pragmas to `0.8.0` to ensure that contracts do not accidentally get deployed using the compiler version that might introduce bugs that affect the contract system negatively.

### Protect from Re-entrancy

- `HodlVault` use `Openzepplin`'s `ReentrancyGuard` to protect `redeem`, `forceRedeem` and `claim` functions from Re-entrancy attack

### Checks-Effects-Interactions

- `HodlVault` avoids state changes after external calls in `lock`, `increaseAmount`, `redeem`, `forceRedeem` and `claim` functions


