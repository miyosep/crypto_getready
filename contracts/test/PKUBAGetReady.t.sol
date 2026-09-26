// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
import {Test} from "forge-std/Test.sol";
import {PKUBAGetReady} from "../src/PKUBAGetReady.sol";
import {PKUBAOnchainGuestbook} from "../src/PKUBAOnchainGuestbook.sol";

contract StudentAccount {
    function leave(PKUBAGetReady quest) external { quest.leaveMessage("Hello from my smart account"); }
}

contract PKUBAGetReadyTest is Test {
    receive() external payable {}
    PKUBAGetReady quest;
    address student = address(0xBEEF);
    function setUp() public { quest = new PKUBAGetReady(); }
    function testFirstMessageMintsToAuthor() public {
        vm.prank(student); quest.leaveMessage("Hello");
        assertEq(quest.ownerOf(1), student);
        assertEq(quest.tokenOf(student), 1);
        assertEq(quest.balanceOf(student), 1);
        assertTrue(quest.supportsInterface(0x80ac58cd));
        assertTrue(quest.supportsInterface(0x5b5e139f));
    }
    function testRepeatAndTransferNeverAllowSecondMint() public {
        vm.startPrank(student);
        quest.leaveMessage("First");
        string memory originalMetadata = quest.tokenURI(1);
        quest.transferFrom(student, address(0xCAFE), 1);
        quest.leaveMessage("Again");
        vm.stopPrank();
        assertEq(quest.totalMinted(), 1);
        assertEq(quest.tokenOf(student), 1);
        assertEq(quest.ownerOf(1), address(0xCAFE));
        assertEq(quest.issuedTo(1), student);
        assertEq(quest.tokenURI(1), originalMetadata);
    }
    function testEachAddressGetsItsOwnToken() public {
        vm.prank(student); quest.leaveMessage("One");
        vm.prank(address(0xCAFE)); quest.leaveMessage("Two");
        assertEq(quest.totalMinted(), 2);
        assertEq(quest.ownerOf(2), address(0xCAFE));
    }
    function testInvalidMessageDoesNotMint() public {
        vm.expectRevert(PKUBAOnchainGuestbook.EmptyMessage.selector); quest.leaveMessage("");
        vm.expectRevert(PKUBAOnchainGuestbook.MessageTooLong.selector); quest.leaveMessage(string(new bytes(281)));
        assertEq(quest.totalMinted(), 0);
    }
    function testSmartAccountWithoutReceiverCanParticipate() public {
        StudentAccount account = new StudentAccount();
        account.leave(quest);
        assertEq(quest.ownerOf(1), address(account));
        assertEq(quest.tokenOf(address(account)), 1);
    }
    function testMetadataRequiresExistingToken() public {
        vm.expectRevert(); quest.tokenURI(1);
        quest.leaveMessage("Hello");
        assertGt(bytes(quest.tokenURI(1)).length, 100);
    }
    function testRejectsPaymentWithoutMinting() public {
        vm.deal(address(this), 1 ether);
        (bool ok,) = address(quest).call{value: 1 wei}(abi.encodeCall(quest.leaveMessage, ("Hello")));
        assertFalse(ok);
        assertEq(quest.totalMinted(), 0);
    }

    function testPlainTransferReceivesEthWithoutMinting() public {
        vm.deal(student, 1 ether);
        vm.expectEmit(true, false, false, true, address(quest));
        emit PKUBAGetReady.TransferReceived(student, 0.02333 ether);
        vm.prank(student);
        (bool ok,) = address(quest).call{value: 0.02333 ether}("");
        assertTrue(ok);
        assertEq(address(quest).balance, 0.02333 ether);
        assertEq(quest.totalMinted(), 0);
        assertEq(quest.tokenOf(student), 0);
        vm.prank(student);
        quest.leaveMessage("After transfer");
        assertEq(quest.ownerOf(1), student);
    }

    function testUnknownCalldataStillRejected() public {
        vm.deal(student, 1 ether);
        vm.prank(student);
        (bool ok,) = address(quest).call{value: 0.02333 ether}(hex"deadbeef");
        assertFalse(ok);
        assertEq(address(quest).balance, 0);
    }

    function testOnlyDeployerCanWithdraw() public {
        vm.deal(address(quest), 0.2 ether);
        vm.prank(student);
        vm.expectRevert(PKUBAGetReady.OnlyDeployer.selector);
        quest.withdraw();
        assertEq(address(quest).balance, 0.2 ether);
        assertEq(quest.deployer(), address(this));
        uint256 beforeBalance = address(this).balance;
        vm.expectEmit(true, false, false, true, address(quest));
        emit PKUBAGetReady.FundsWithdrawn(address(this), 0.2 ether);
        quest.withdraw();
        assertEq(address(this).balance, beforeBalance + 0.2 ether);
        assertEq(address(quest).balance, 0);
        vm.prank(student);
        quest.leaveMessage("Still works");
        assertEq(quest.ownerOf(1), student);
    }

    function testEmptyWithdrawalReverts() public {
        vm.expectRevert(PKUBAGetReady.NothingToWithdraw.selector);
        quest.withdraw();
    }

    function testWithdrawalFailureKeepsFunds() public {
        RejectingDeployer receiver = new RejectingDeployer();
        PKUBAGetReady other = receiver.quest();
        vm.deal(address(other), 0.02333 ether);
        vm.expectRevert(PKUBAGetReady.WithdrawalFailed.selector);
        receiver.withdraw();
        assertEq(address(other).balance, 0.02333 ether);
    }
}

contract RejectingDeployer {
    PKUBAGetReady public quest = new PKUBAGetReady();
    function withdraw() external { quest.withdraw(); }
}
