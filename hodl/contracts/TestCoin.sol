//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestCoin is ERC20 {
  constructor(uint256 initialSupply) ERC20("TestCoin", "TC") {
    _mint(msg.sender, initialSupply);
  }

  function faucet() external {
    _mint(msg.sender, 100 * (10 ** 18));
  }
}