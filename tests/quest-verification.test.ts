import { it } from "node:test";
import assert from "node:assert/strict";
import { encodeAbiParameters, encodeEventTopics, type Address, type Transaction, type TransactionReceipt } from "viem";
import { guestbookAbi } from "../lib/contract";
import { QUEST_TRANSFER_AMOUNT, verifyQuestPair } from "../lib/quest-verification";

const contract = "0x1111111111111111111111111111111111111111" as Address;
const wallet = "0x2222222222222222222222222222222222222222" as Address;
const other = "0x3333333333333333333333333333333333333333" as Address;
const transfer = { hash: `0x${"a".repeat(64)}`, from: wallet, to: contract, input: "0x", value: QUEST_TRANSFER_AMOUNT, chainId: 11155111 } as unknown as Transaction;
const message = { ...transfer, hash: `0x${"b".repeat(64)}`, value: 0n } as Transaction;
const received = {
  address: contract,
  topics: encodeEventTopics({ abi: guestbookAbi, eventName: "TransferReceived", args: { sender: wallet } }),
  data: encodeAbiParameters([{ type: "uint256" }], [QUEST_TRANSFER_AMOUNT]),
};
const messageLog = {
  address: contract,
  topics: encodeEventTopics({ abi: guestbookAbi, eventName: "MessageLeft", args: { sender: wallet } }),
  data: encodeAbiParameters([{ type: "string" }, { type: "uint256" }], ["Hello", 1n]),
};
const transferReceipt = { transactionHash: transfer.hash, status: "success", blockNumber: 10n, transactionIndex: 0, logs: [received] } as unknown as TransactionReceipt;
const messageReceipt = { ...transferReceipt, transactionHash: message.hash, blockNumber: 11n, logs: [messageLog] } as unknown as TransactionReceipt;

it("binds delegated message author to independently verified transfer sender", () => {
  assert.equal(verifyQuestPair(contract, 1n, transfer, transferReceipt, { ...message, from: other, to: other }, messageReceipt).sender, wallet);
  const wrongAuthor = { ...messageLog, topics: encodeEventTopics({ abi: guestbookAbi, eventName: "MessageLeft", args: { sender: other } }) };
  assert.throws(() => verifyQuestPair(contract, 1n, transfer, transferReceipt, message, { ...messageReceipt, logs: [wrongAuthor] } as TransactionReceipt), /MessageLeft/);
});

it("rejects failed, spoofed, malformed and missing receipt evidence", () => {
  for (const receipt of [
    { ...transferReceipt, status: "reverted" },
    { ...transferReceipt, logs: [] },
    { ...transferReceipt, logs: [{ ...received, address: other }] },
    { ...transferReceipt, logs: [{ ...received, data: "0x" }] },
    { ...transferReceipt, logs: [{ ...received, data: encodeAbiParameters([{ type: "uint256" }], [1n]) }] },
    { ...transferReceipt, transactionHash: message.hash },
  ]) assert.throws(() => verifyQuestPair(contract, 1n, transfer, receipt as TransactionReceipt, message, messageReceipt));
  assert.throws(() => verifyQuestPair(contract, 1n, transfer, transferReceipt, message, { ...messageReceipt, status: "reverted" }), /did not succeed/);
  assert.throws(() => verifyQuestPair(contract, 1n, transfer, transferReceipt, message, { ...messageReceipt, logs: [{ ...messageLog, address: other }] } as TransactionReceipt), /MessageLeft/);
});

it("enforces network, deployment, amount, calldata and transaction order", () => {
  for (const tx of [{ ...transfer, chainId: 1 }, { ...transfer, value: 1n }, { ...transfer, to: other }, { ...transfer, input: "0x1234" }])
    assert.throws(() => verifyQuestPair(contract, 1n, tx as Transaction, transferReceipt, message, messageReceipt));
  assert.throws(() => verifyQuestPair(contract, 11n, transfer, transferReceipt, message, messageReceipt), /predates/);
  assert.throws(() => verifyQuestPair(contract, 1n, transfer, transferReceipt, transfer, transferReceipt), /distinct/);
  const sameBlock = { ...messageReceipt, blockNumber: 10n, transactionIndex: 1 };
  assert.equal(verifyQuestPair(contract, 1n, transfer, transferReceipt, message, sameBlock).content, "Hello");
  assert.throws(() => verifyQuestPair(contract, 1n, transfer, { ...transferReceipt, transactionIndex: 2 }, message, sameBlock), /before the message/);
});
