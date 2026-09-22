// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script} from "forge-std/Script.sol";
import {PKUBAOnchainGuestbook} from "../src/PKUBAOnchainGuestbook.sol";

/// @notice Deploy only to Ethereum Sepolia; supply the signer via the Forge CLI.
contract Deploy is Script {
    function run() external returns (PKUBAOnchainGuestbook guestbook) {
        require(block.chainid == 11155111, "Deployment must target Ethereum Sepolia");
        vm.startBroadcast();
        guestbook = new PKUBAOnchainGuestbook();
        vm.stopBroadcast();
    }
}
