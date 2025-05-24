// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract SampleToken is ERC20 , Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name,symbol) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract TokenFactory is Ownable {
    event TokenCreated (
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply,
        address creator
    );

    address[] public allTokens;

    constructor() Ownable(msg.sender) {}


    function createToken(string memory name, string memory symbol, uint256 initialSupply)  external returns (address) {
        ERC20 newToken = new SampleToken(name, symbol, initialSupply, msg.sender);
        allTokens.push(address(newToken));

        emit TokenCreated(address(newToken), name, symbol, initialSupply, msg.sender);
        return address(newToken);
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }


}