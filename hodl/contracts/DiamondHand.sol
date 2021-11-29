//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IHodlVault.sol";

contract DiamondHand is ERC721URIStorage, AccessControl {
  using SafeMath for uint256;

  bytes32 public constant MINTER = keccak256("MINTER");

  uint256 private _currentTokenId = 0;

  constructor() ERC721("DiamondHand", "DMH") {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function mintTo(
    address _to,
    IHodlVault vault
  ) public onlyRole(MINTER) {
    _safeMint(_to, _currentTokenId);
    _setTokenURI(_currentTokenId, formatTokenURI(vault));
    _currentTokenId = _currentTokenId.add(1);
  }

  function formatTokenURI(IHodlVault vault) private view returns (string memory) {
    return string(abi.encodePacked(vault.token()));
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
}
}