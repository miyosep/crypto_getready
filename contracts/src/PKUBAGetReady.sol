// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PKUBAOnchainGuestbook} from "./PKUBAOnchainGuestbook.sol";
import {QuestArtwork} from "./QuestArtwork.sol";

/// @notice A first message and a commemorative NFT in one transaction.
contract PKUBAGetReady is PKUBAOnchainGuestbook, ERC721, ReentrancyGuard {
    mapping(address => uint256) public tokenOf;
    mapping(uint256 => address) public issuedTo;
    uint256 public totalMinted;
    /// @notice Set once at deployment; there is no function to change this address.
    address public deployer;

    error OnlyDeployer();
    error NothingToWithdraw();
    error WithdrawalFailed();
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    /// @notice Records a plain ETH transfer separately from a message.
    event TransferReceived(address indexed sender, uint256 amount);

    constructor() ERC721("PKUBA Get Ready 2026", "PKUBA26") {
        deployer = msg.sender;
    }

    /// @notice Accept ETH sent with empty calldata. Receiving ETH does not mint an NFT.
    receive() external payable {
        emit TransferReceived(msg.sender, msg.value);
    }

    /// @notice Only the deploying account can recover the contract's ETH, to itself.
    function withdraw() external nonReentrant {
        if (msg.sender != deployer) revert OnlyDeployer();
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();
        (bool success,) = payable(deployer).call{value: amount}("");
        if (!success) revert WithdrawalFailed();
        emit FundsWithdrawn(deployer, amount);
    }

    function leaveMessage(string calldata content) public override {
        super.leaveMessage(content);
        if (tokenOf[msg.sender] == 0) {
            uint256 tokenId = ++totalMinted;
            tokenOf[msg.sender] = tokenId;
            issuedTo[tokenId] = msg.sender;
            // No receiver callback: smart accounts can participate without implementing
            // IERC721Receiver. The caller only mints to itself, never to an arbitrary recipient.
            _mint(msg.sender, tokenId);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat("data:application/json;base64,", Base64.encode(bytes(string.concat(
            '{"name":"PKUBA Get Ready #', Strings.toString(tokenId),
            '","description":"A first onchain message. PKU Blockchain, Fall 2026. Sepolia participation souvenir.",',
            '"attributes":[{"trait_type":"Edition","value":"Fall 2026"},{"trait_type":"Network","value":"Ethereum Sepolia"}],',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(QuestArtwork.svg(issuedTo[tokenId], tokenId))), '"}'
        ))));
    }
}
