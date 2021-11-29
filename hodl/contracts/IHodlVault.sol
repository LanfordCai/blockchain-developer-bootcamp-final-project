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

    function increaseAmount(uint256 _amount) external;

    function redeem() external;

    function forceRedeem() external;

    function claim() external;
}
