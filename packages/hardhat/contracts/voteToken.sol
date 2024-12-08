// VoteToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VoteToken is ERC721Enumerable, Ownable {
    constructor() ERC721("VoteToken", "VTT") Ownable(msg.sender) {}
    
    // Solo el owner (BuildingDAO) puede mintear tokens
    function mint(address to, uint256 tokenId) external onlyOwner {
        _safeMint(to, tokenId);
    }
    
    // Solo el owner puede quemar tokens
    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }
}