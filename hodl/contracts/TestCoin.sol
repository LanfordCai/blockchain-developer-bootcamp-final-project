//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC20 token used for testing purpose
contract TestCoin is ERC20 {
    constructor(uint256 initialSupply) ERC20("TestCoin", "TC") {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Anybody can call this method to get 100 TC
    function faucet() external {
        _mint(msg.sender, 100 * (10**18));
    }
}
