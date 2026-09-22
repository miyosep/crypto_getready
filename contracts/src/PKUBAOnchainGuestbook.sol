// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title PKUBA Onchain Guestbook
/// @notice A first smart-contract interaction for PKUBA students. Repeat messages are welcome.
/// @dev Messages live in transaction event logs, not a growing array in contract storage.
contract PKUBAOnchainGuestbook {
    /// @notice Content cannot be empty.
    error EmptyMessage();
    /// @notice Content exceeds the 280-byte UTF-8 limit.
    error MessageTooLong();

    /// @notice A public message left by a wallet.
    /// @param sender The caller of leaveMessage, indexed for log filtering.
    /// @param content The original message, preserved without trimming.
    /// @param timestamp The block timestamp in Unix seconds.
    event MessageLeft(address indexed sender, string content, uint256 timestamp);

    /// @notice Emit a message. This function does not accept ETH.
    /// @dev The limit is bytes, not characters: Chinese characters commonly take 3 UTF-8 bytes.
    ///      Whitespace is valid at the contract level; the UI also rejects whitespace-only input.
    /// @param content A nonempty message of at most 280 bytes.
    function leaveMessage(string calldata content) public virtual {
        uint256 length = bytes(content).length;
        if (length == 0) revert EmptyMessage();
        if (length > 280) revert MessageTooLong();
        emit MessageLeft(msg.sender, content, block.timestamp);
    }
}
