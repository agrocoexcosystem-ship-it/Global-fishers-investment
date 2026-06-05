// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PXX is ERC20, Ownable {
    uint256 public tokenPrice = 0.001 ether; // price per token in ETH
    address public treasury;

    constructor(address _treasury) ERC20("Platinum Xtreme Xchange", "PXX") {
        treasury = _treasury;
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals()); // 1B supply
    }

    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 amount = (msg.value * 10 ** decimals()) / tokenPrice;
        require(balanceOf(owner()) >= amount, "Not enough tokens left");
        _transfer(owner(), msg.sender, amount);
        payable(treasury).transfer(msg.value);
    }

    function setPrice(uint256 _newPrice) external onlyOwner {
        tokenPrice = _newPrice;
    }
}
