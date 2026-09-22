// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {PKUBAOnchainGuestbook} from "../src/PKUBAOnchainGuestbook.sol";

contract PKUBAOnchainGuestbookTest is Test {
    PKUBAOnchainGuestbook internal guestbook;
    address internal student = address(0xBEEF);
    event MessageLeft(address indexed sender, string content, uint256 timestamp);

    function setUp() public {
        guestbook = new PKUBAOnchainGuestbook();
    }

    function testValidMessageEmitsSenderContentAndTimestamp() public {
        vm.warp(1_790_000_000);
        vm.prank(student);
        vm.expectEmit(true, false, false, true, address(guestbook));
        emit MessageLeft(student, "Hello PKUBA!", block.timestamp);
        guestbook.leaveMessage("Hello PKUBA!");
    }

    function testEmptyMessageReverts() public {
        vm.expectRevert(PKUBAOnchainGuestbook.EmptyMessage.selector);
        guestbook.leaveMessage("");
    }

    function testOverLengthMessageReverts() public {
        vm.expectRevert(PKUBAOnchainGuestbook.MessageTooLong.selector);
        guestbook.leaveMessage(string(new bytes(281)));
    }

    function testExactly280BytesSucceeds() public {
        string memory content = string(new bytes(280));
        vm.expectEmit(true, false, false, true, address(guestbook));
        emit MessageLeft(address(this), content, block.timestamp);
        guestbook.leaveMessage(content);
    }

    function testChineseMessageSucceeds() public {
        string memory content = unicode"你好北大，我想学习零知识证明。";
        vm.expectEmit(true, false, false, true, address(guestbook));
        emit MessageLeft(address(this), content, block.timestamp);
        guestbook.leaveMessage(content);
    }

    function testMultibyteLimitIsBytes() public {
        bytes memory content;
        for (uint256 i; i < 94; i++) {
            content = abi.encodePacked(content, unicode"中");
        }
        assertEq(content.length, 282);
        vm.expectRevert(PKUBAOnchainGuestbook.MessageTooLong.selector);
        guestbook.leaveMessage(string(content));
    }

    function testMultipleMessagesAllowed() public {
        vm.startPrank(student);
        guestbook.leaveMessage("First");
        vm.expectEmit(true, false, false, true, address(guestbook));
        emit MessageLeft(student, "Second", block.timestamp);
        guestbook.leaveMessage("Second");
        vm.stopPrank();
    }

    function testRejectsEther() public {
        vm.deal(address(this), 1 ether);
        (bool success,) = address(guestbook).call{value: 1 wei}(abi.encodeCall(guestbook.leaveMessage, ("Hello")));
        assertFalse(success);
    }

    function testFuzzMessageLength(bytes memory content) public {
        if (content.length == 0) {
            vm.expectRevert(PKUBAOnchainGuestbook.EmptyMessage.selector);
        } else if (content.length > 280) {
            vm.expectRevert(PKUBAOnchainGuestbook.MessageTooLong.selector);
        } else {
            vm.expectEmit(true, false, false, true, address(guestbook));
            emit MessageLeft(address(this), string(content), block.timestamp);
        }
        guestbook.leaveMessage(string(content));
    }
}
