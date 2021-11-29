//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title HodlVault interface
interface IHodlVault {
    function token() external view returns (IERC20);

    function lock(
        uint256 _amount,
        uint256 _lockWindow,
        uint256 _penalty
    ) external;

    function redeem(uint256 index) external;

    function forceRedeem(uint256 index) external;

    function claim(uint256 index) external;
}
