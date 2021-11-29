//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IHodlVault.sol";

/// @title A vault used to store locked assets
/// @author Lanford33
contract HodlVault is IHodlVault, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

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
        Status status;
    }

    /// @notice Query lock info via address
    mapping(address => LockInfo) public locks;

    uint256 public maxLockWindow = 4 * 365 days;

    /// @notice Penalty will be sent to this address
    address public penaltyReceiver;

    IERC20 private _token;

    /// @notice Emit when a new lock created
    event LockCreated(
        address indexed account,
        uint256 amount,
        uint256 unlockTime,
        uint256 penalty
    );

    /// @notice Emit when the user increase funds in a lock vault
    event LockedAmountIncreased(
        address indexed account,
        uint256 increasedAmount,
        uint256 totalAmount,
        uint256 unlockTime
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

    constructor(IERC20 __token) {
        _token = __token;
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
        require(_lockWindow > 0, "lockWindow should > 0");
        require(_penalty <= 100, "penalty ratio should in range 0..100");

        LockInfo storage lockInfo = locks[msg.sender];
        require(
            lockInfo.status == Status.Active && lockInfo.amount == 0,
            "Lock already exists"
        );
        uint256 unlockTime = block.timestamp.add(_lockWindow);

        lockInfo.amount = _amount;
        lockInfo.unlockTime = unlockTime;
        lockInfo.lockWindow = _lockWindow;
        lockInfo.penalty = _penalty;
        lockInfo.status = Status.Active;

        _token.safeTransferFrom(msg.sender, address(this), _amount);

        emit LockCreated(msg.sender, _amount, unlockTime, _penalty);
    }

    /// @notice Add more funds to the vault
    /// @param _amount The amount going to add in vault
    /// @dev After increasing amount, the lockTime will be re-calculated, and the start-time will be reset to now.
    function increaseAmount(uint256 _amount) external override {
        require(_amount > 0, "Amount should > 0");
        LockInfo storage lockInfo = locks[msg.sender];
        require(
            lockInfo.status == Status.Active,
            "Lock should in Active status"
        );

        uint256 newUnlockTime = block.timestamp.add(lockInfo.lockWindow);
        lockInfo.amount = lockInfo.amount.add(_amount);
        lockInfo.unlockTime = newUnlockTime;

        _token.safeTransferFrom(msg.sender, address(this), _amount);

        emit LockedAmountIncreased(
            msg.sender,
            _amount,
            lockInfo.amount,
            newUnlockTime
        );
    }

    /// @notice Redeem funds from vault
    function redeem() external override nonReentrant {
        LockInfo storage lockInfo = locks[msg.sender];
        require(
            lockInfo.status == Status.Active,
            "Lock should in Active status"
        );
        require(lockInfo.unlockTime <= block.timestamp, "Can't redeem now");
        require(lockInfo.amount > 0, "Lock is empty");

        _redeem(lockInfo);
    }

    /// @notice Force redeem funds from vault
    function forceRedeem() external override nonReentrant {
        LockInfo storage lockInfo = locks[msg.sender];
        require(
            lockInfo.status == Status.Active,
            "Lock should in Active status"
        );
        require(lockInfo.amount > 0, "Lock is empty");

        if (lockInfo.unlockTime <= block.timestamp) {
            _redeem(lockInfo);
        } else {
            uint256 amount = lockInfo.amount;
            uint256 penaltyAmount = amount.div(100).mul(lockInfo.penalty);
            uint256 transferAmount = amount.sub(penaltyAmount);

            lockInfo.amount = 0;
            lockInfo.status = Status.ForceRedeemed;

            _token.safeTransferFrom(address(this), msg.sender, transferAmount);
            _token.safeTransferFrom(
                address(this),
                penaltyReceiver,
                penaltyAmount
            );

            emit ForceRedeemed(msg.sender, transferAmount, penaltyAmount);
        }
    }

    /// @notice Claim NFT after redeeming funds
    function claim() external override nonReentrant {
        LockInfo storage lockInfo = locks[msg.sender];
        require(
            lockInfo.status == Status.Redeemed,
            "Lock should in Redeemed status"
        );
        lockInfo.status = Status.Claimed;

        emit Claimed(msg.sender);
    }

    function setPenaltyReceiver(address _receiver) public onlyOwner {
        penaltyReceiver = _receiver;
    }

    function setMaxLockWindow(uint256 _maxLockWindow) public onlyOwner {
        maxLockWindow = _maxLockWindow;
    }

    function _redeem(LockInfo storage lockInfo) private {
        uint256 amount = lockInfo.amount;

        lockInfo.amount = 0;
        lockInfo.status = Status.Redeemed;
        _token.safeTransferFrom(address(this), msg.sender, amount);

        emit Redeemed(msg.sender, amount);
    }
}
