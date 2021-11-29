//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IHodlVault.sol";
import "./DiamondHand.sol";
import "./HexStrings.sol";

/// @title A vault used to store locked assets
/// @author Lanford33
contract HodlVault is IHodlVault, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using HexStrings for uint256;

    enum Status {
        Active,
        Redeemed,
        ForceRedeemed,
        Claimed
    }

    struct LockInfo {
        uint256 amount;
        uint256 unlockTime;
        uint256 lockWindow;
        uint256 penalty;
        uint256 amountRecord;
        Status status;
    }

    /// @notice Query lock info via address
    mapping(address => LockInfo[]) public locks;

    uint256 public maxLockWindow = 4 * 365 days;
    uint256 public maxLocksPerUser = 5;

    /// @notice Penalty will be sent to this address
    address public penaltyReceiver;

    IERC20 private _token;
    DiamondHand private _diamondHand;

    /// @notice Emit when a new lock created
    event LockCreated(
        address indexed account,
        uint256 amount,
        uint256 unlockTime,
        uint256 penalty
    );

    /// @notice Emit when a vault is redeemed
    event Redeemed(address indexed account, uint256 amount);

    /// @notice Emit when a vault is force-redeemed
    event ForceRedeemed(
        address indexed account,
        uint256 amount,
        uint256 penalty
    );

    /// @notice Emit when a DiamondHand NFT is claimed
    event Claimed(address indexed account);

    constructor(IERC20 __token, DiamondHand __diamondHand) {
        _token = __token;
        _diamondHand = __diamondHand;
        penaltyReceiver = msg.sender;
    }

    /// @return The token supported
    function token() external view override returns (IERC20) {
        return _token;
    }

    /// @notice Create new lock
    /// @param _amount The amount of token to lock
    /// @param _lockWindow The time period in second of lock
    /// @param _penalty The penalty ratio of force-redeem
    function lock(
        uint256 _amount,
        uint256 _lockWindow,
        uint256 _penalty
    ) external override {
        require(_amount > 0, "Amount should > 0");
        require(
            _lockWindow > 0 && _lockWindow < maxLockWindow,
            "lockWindow should greater than 0 and smaller than maxLockWindow"
        );
        require(_penalty <= 100, "penalty ratio should in range 0..100");

        LockInfo[] storage lockItems = locks[msg.sender];
        require(lockItems.length < maxLocksPerUser, "Lock number limit exceed");

        uint256 unlockTime = block.timestamp.add(_lockWindow);

        lockItems.push(
            LockInfo({
                amount: _amount,
                unlockTime: unlockTime,
                lockWindow: _lockWindow,
                penalty: _penalty,
                amountRecord: _amount,
                status: Status.Active
            })
        );

        _token.safeTransferFrom(msg.sender, address(this), _amount);

        emit LockCreated(msg.sender, _amount, unlockTime, _penalty);
    }

    /// @notice Redeem funds from vault
    function redeem(uint256 index) external override nonReentrant {
        LockInfo storage lockInfo = locks[msg.sender][index];
        require(lockInfo.status == Status.Active, "Invalid lock status");
        require(lockInfo.unlockTime <= block.timestamp, "Can't redeem now");
        require(lockInfo.amount > 0, "Lock is empty");

        _redeem(lockInfo);
    }

    /// @notice Force redeem funds from vault
    function forceRedeem(uint256 index) external override nonReentrant {
        LockInfo storage lockInfo = locks[msg.sender][index];
        require(lockInfo.status == Status.Active, "Invalid lock status");
        require(lockInfo.amount > 0, "Lock is empty");

        if (lockInfo.unlockTime <= block.timestamp) {
            _redeem(lockInfo);
        } else {
            uint256 amount = lockInfo.amount;
            uint256 penaltyAmount = amount.div(100).mul(lockInfo.penalty);
            uint256 transferAmount = amount.sub(penaltyAmount);

            lockInfo.amount = 0;
            lockInfo.status = Status.ForceRedeemed;

            _token.safeTransfer(msg.sender, transferAmount);
            _token.safeTransfer(penaltyReceiver, penaltyAmount);

            emit ForceRedeemed(msg.sender, transferAmount, penaltyAmount);
        }
    }

    /// @notice Claim NFT after redeeming funds
    function claim(uint256 index) external override nonReentrant {
        LockInfo storage lockInfo = locks[msg.sender][index];
        require(
            lockInfo.status == Status.Redeemed,
            "Lock should in Redeemed status"
        );
        lockInfo.status = Status.Claimed;
        DiamondHand.SVGParams memory svgParams = DiamondHand.SVGParams({
            token: addressToString(address(_token)),
            amount: lockInfo.amountRecord,
            lockWindow: lockInfo.lockWindow,
            penaltyRatio: lockInfo.penalty
        });

        _diamondHand.mintTo(msg.sender, svgParams);

        emit Claimed(msg.sender);
    }

    function setPenaltyReceiver(address _receiver) public onlyOwner {
        penaltyReceiver = _receiver;
    }

    function setMaxLockWindow(uint256 _maxLockWindow) public onlyOwner {
        maxLockWindow = _maxLockWindow;
    }

    function setMaxLocksPerUser(uint256 _maxLocksPerUser) public onlyOwner {
        maxLocksPerUser = _maxLocksPerUser;
    }

    function _redeem(LockInfo storage lockInfo) private {
        uint256 amount = lockInfo.amount;

        lockInfo.amount = 0;
        lockInfo.status = Status.Redeemed;
        _token.safeTransfer(msg.sender, amount);

        emit Redeemed(msg.sender, amount);
    }

    function addressToString(address addr)
        internal
        pure
        returns (string memory)
    {
        return (uint256(uint160(address(addr)))).toHexString(20);
    }
}
