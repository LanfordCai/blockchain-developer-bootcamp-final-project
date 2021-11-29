//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IHodlVault.sol";
import "base64-sol/base64.sol";

/// @title The ERC721 NFT for all the users who finished a lock
contract DiamondHand is ERC721URIStorage, AccessControl {
    using SafeMath for uint256;

    struct SVGParams {
        string token;
        uint256 amount;
        uint256 lockWindow;
        uint256 penaltyRatio;
    }

    bytes32 public constant MINTER = keccak256("MINTER");

    uint256 private _currentTokenId = 0;

    constructor() ERC721("DiamondHand", "DMH") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintTo(address _to, SVGParams memory params)
        public
        onlyRole(MINTER)
    {
        _safeMint(_to, _currentTokenId);
        _setTokenURI(_currentTokenId, constructTokenURI(params));
        _currentTokenId = _currentTokenId.add(1);
    }

    function generateSVG(SVGParams memory params)
        private
        pure
        returns (string memory svg)
    {
        svg = string(
            abi.encodePacked(
                '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>',
                '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="450" height="800" viewBox="0 0 450 800" xml:space="preserve">',
                "<defs></defs>",
                '<rect x="0" y="0" width="100%" height="100%" fill="transparent"></rect>',
                '<g transform="matrix(0 0 0 0 0 0)" id="305707c2-90c4-456b-a52d-4592857a433d"  ></g>',
                '<g transform="matrix(1 0 0 1 225 400)" id="d4ee7583-f471-46f4-8849-b590fec13431"  >',
                '<rect style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,173,0); fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  x="-225" y="-400" rx="0" ry="0" width="450" height="800" /></g>',
                '<g transform="matrix(1.07 0 0 1.07 225 249.69)" style="" id="c7baa726-6929-40ea-a13f-1b7d3a2f52da"  >',
                '<rect opacity="0" fill="rgb(2,2,2)" x="-370.55" y="-37.85" width="741.09" height="75.71"></rect>',
                '<text xml:space="preserve" font-family="Roboto" font-size="67" font-style="normal" font-weight="700" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-134.2" y="21.05" >Diamond</tspan></text></g>',
                '<g transform="matrix(1 0 0 1 225 331.57)" style="" id="159e2ed2-61a8-4660-957a-a1689f3662f9"  >',
                '<text xml:space="preserve" font-family="Roboto" font-size="69" font-style="normal" font-weight="700" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-81.63" y="21.68" >Hand</tspan></text></g>',
                '<g transform="matrix(1.08 0 0 1.08 225 450.33)" style="" id="8ca46c6b-558c-41c5-8bbf-764b44f6bc67"  >',
                '<text xml:space="preserve" font-family="Roboto" font-size="14" font-style="normal" font-weight="400" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-184.06" y="4.4" >Token: 0x91C538676eA5ca642fCcC386eAa8f0F7abcB3c2f</tspan></text></g>',
                '<g transform="matrix(1.08 0 0 1.08 225 488.21)" style=""  >',
                '<text xml:space="preserve" font-family="Roboto" font-size="14" font-style="normal" font-weight="400" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-69.32" y="4.4" >',
                "Lock Window: ",
                params.lockWindow,
                "</tspan></text></g>",
                '<g transform="matrix(1.08 0 0 1.08 225 524.24)" style=""  >',
                '<text xml:space="preserve" font-family="Roboto" font-size="14" font-style="normal" font-weight="400" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-110.67" y="4.4" >',
                "Amount: ",
                params.amount,
                "</tspan></text></g>",
                '<g transform="matrix(1.08 0 0 1.08 225 560.27)" style=""  >'
                '<text xml:space="preserve" font-family="Roboto" font-size="14" font-style="normal" font-weight="400" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1; white-space: pre;" ><tspan x="-57.29" y="4.4" >',
                "Penalty Ratio: ",
                params.penaltyRatio,
                "%</tspan></text></g></svg>"
            )
        );
    }

    function constructTokenURI(SVGParams memory params)
        public
        pure
        returns (string memory)
    {
        string memory image = Base64.encode(bytes(generateSVG(params)));

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"DiamondHand", "description":"for real HODLer!", "image": "',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
