//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IHodlVault.sol";

contract HodlVault is IHodlVault, Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  
  enum Status {
    Active, Redeemed, ForceRedeemed, Claimed
  }

  struct LockInfo {
    uint256 amount;
    uint256 unlockTime;
    uint256 lockWindow;
    uint256 penalty;
    Status status;
  }

  mapping(address => LockInfo) public locks;
  uint256 public maxLockWindow = 4 * 365 days;
  address public penaltyReceiver;
  IERC20 private _token;

  event LockCreated(address indexed account, uint256 amount, uint256 unlockTime, uint256 penalty);
  event LockedAmountIncreased(address indexed account, uint256 increasedAmount, uint256 totalAmount, uint256 unlockTime);
  event Redeemed(address indexed account, uint256 amount);
  event ForceRedeemed(address indexed account, uint256 amount, uint256 penalty);
  event Claimed(address indexed account);

  constructor(IERC20 __token) {
    _token = __token;
    penaltyReceiver = msg.sender;
  }

  function token() external view override returns (IERC20) {
    return _token;
  }

  function lock(uint256 _amount, uint256 _lockWindow, uint256 _penalty) external override {
    require(_amount > 0, "Amount should > 0");
    require(_lockWindow > 0, "lockWindow should > 0");
    require(_penalty <= 100, "penalty ratio should in range 0..100");

    LockInfo storage lockInfo = locks[msg.sender];
    require(lockInfo.status == Status.Active && lockInfo.amount == 0, "Lock already exists");
    uint256 unlockTime = block.timestamp.add(_lockWindow);

    lockInfo.amount = _amount;
    lockInfo.unlockTime = unlockTime;
    lockInfo.lockWindow = _lockWindow;
    lockInfo.penalty = _penalty;
    lockInfo.status = Status.Active;

    _token.safeTransferFrom(msg.sender, address(this), _amount);

    emit LockCreated(msg.sender, _amount, unlockTime, _penalty);
  }

  function increaseAmount(uint256 _amount) external override {
    require(_amount > 0, "Amount should > 0");
    LockInfo storage lockInfo = locks[msg.sender];
    require(lockInfo.status == Status.Active, "Lock should in Active status");

    uint256 newUnlockTime = block.timestamp.add(lockInfo.lockWindow);
    lockInfo.amount = lockInfo.amount.add(_amount);
    lockInfo.unlockTime = newUnlockTime;

    emit LockedAmountIncreased(msg.sender, _amount, lockInfo.amount, newUnlockTime);
  }

  function redeem() external override nonReentrant {
    LockInfo storage lockInfo = locks[msg.sender];
    require(lockInfo.status == Status.Active, "Lock should in Active status");
    require(lockInfo.unlockTime <= block.timestamp, "Can't redeem now");
    require(lockInfo.amount > 0, "Lock is empty");

    _redeem(lockInfo);
  }

  function forceRedeem() external override nonReentrant {
    LockInfo storage lockInfo = locks[msg.sender]; 
    require(lockInfo.status == Status.Active, "Lock should in Active status");
    require(lockInfo.amount > 0, "Lock is empty");

    if (lockInfo.unlockTime <= block.timestamp) {
      _redeem(lockInfo);
    } else {
      uint256 amount = lockInfo.amount;
      uint256 penaltyAmount = amount.div(100).mul(lockInfo.penalty);
      uint256 transferAmount = amount.sub(penaltyAmount);

      lockInfo.amount = 0;
      _token.safeTransferFrom(address(this), msg.sender, transferAmount);
      _token.safeTransferFrom(address(this), penaltyReceiver, penaltyAmount);

      lockInfo.status = Status.ForceRedeemed;
      emit ForceRedeemed(msg.sender, transferAmount, penaltyAmount);
    }
  }

  function claim() external override nonReentrant {
    LockInfo storage lockInfo = locks[msg.sender]; 
    require(lockInfo.status == Status.Redeemed, "Lock should in Redeemed status");
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
    _token.safeTransferFrom(address(this), msg.sender, amount);

    lockInfo.status = Status.Redeemed;
    emit Redeemed(msg.sender, amount);
  }
}