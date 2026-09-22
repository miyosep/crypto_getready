// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {PKUBAOnchainGuestbook} from "./PKUBAOnchainGuestbook.sol";
import {QuestArtwork} from "./QuestArtwork.sol";

/// @notice A first message and a commemorative NFT in one transaction.
contract PKUBAGetReady is PKUBAOnchainGuestbook, ERC721 {
    mapping(address => uint256) public tokenOf;
    mapping(uint256 => address) public issuedTo;
    uint256 public totalMinted;

    constructor() ERC721("PKUBA Get Ready 2026", "PKUBA26") {}

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
