// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
import {Script} from "forge-std/Script.sol";
import {PKUBAGetReady} from "../src/PKUBAGetReady.sol";
contract DeployNFT is Script {
    function run() external returns (PKUBAGetReady quest) {
        require(block.chainid == 11155111, "Deployment must target Ethereum Sepolia");
        vm.startBroadcast();
        quest = new PKUBAGetReady();
        vm.stopBroadcast();
    }
}
