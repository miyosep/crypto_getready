import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  encodeAbiParameters,
  encodeEventTopics,
  type Address,
  type PublicClient,
  type TransactionReceipt,
} from "viem";
import { byteLength, guestbookAbi, validateMessage } from "../lib/contract";
import { parseSettings } from "../lib/settings";
import { loadLogPage, logWindow } from "../lib/logs";
import { findMessage, verifyReceipt } from "../lib/receipts";

const contract: Address = "0x1111111111111111111111111111111111111111";
const wallet: Address = "0x2222222222222222222222222222222222222222";
const other: Address = "0x3333333333333333333333333333333333333333";
const log = {
  address: contract,
  topics: encodeEventTopics({
    abi: guestbookAbi,
    eventName: "MessageLeft",
    args: { sender: wallet },
  }),
  data: encodeAbiParameters(
    [{ type: "string" }, { type: "uint256" }],
    ["你好 PKUBA!", 1790000000n],
  ),
};
const receipt = {
  status: "success",
  to: contract,
  from: wallet,
  logs: [log],
} as unknown as TransactionReceipt;

describe("UTF-8 validation", () => {
  it("rejects blank input and handles Chinese and emoji by bytes", () => {
    assert.equal(byteLength("中🙂"), 7);
    assert.ok(validateMessage(" \n\t"));
    assert.equal(validateMessage("a".repeat(280)), undefined);
    assert.ok(validateMessage("中".repeat(94)));
    assert.equal(validateMessage("🙂".repeat(70)), undefined);
    assert.ok(validateMessage("🙂".repeat(71)));
  });
});

describe("deployment configuration", () => {
  it("requires an explicit address and deployment block", () => {
    assert.equal(parseSettings({}).ready, false);
    assert.equal(parseSettings({ address: contract, block: "0" }).ready, true);
    assert.equal(
      parseSettings({ address: "0x" + "0".repeat(40), block: "1" }).ready,
      false,
    );
    assert.equal(
      parseSettings({ address: contract, block: "-1" }).ready,
      false,
    );
    assert.equal(
      parseSettings({
        address: contract,
        block: "1",
        rpc: "javascript:alert(1)",
      }).ready,
      false,
    );
    assert.equal(
      parseSettings({ address: contract, block: "1", chunk: "1.5" }).ready,
      false,
    );
  });
});

describe("receipt verification", () => {
  it("accepts the actual contract event and its sender", () => {
    assert.equal(
      verifyReceipt(receipt, contract, wallet).content,
      "你好 PKUBA!",
    );
  });
  it("accepts delegated calls but rejects reverted, spoofed, and wrong-author receipts", () => {
    assert.throws(
      () => verifyReceipt({ ...receipt, status: "reverted" }, contract, wallet),
      /succeed/,
    );
    assert.equal(verifyReceipt({ ...receipt, to: other, from: other }, contract, wallet).sender.toLowerCase(), wallet.toLowerCase());
    assert.throws(() => verifyReceipt(receipt, contract, other), /MessageLeft/);
    assert.equal(
      findMessage(
        { logs: [{ ...receipt.logs[0], address: other }] },
        contract,
        wallet,
      ),
      undefined,
    );
    assert.equal(
      findMessage(
        { logs: [{ ...receipt.logs[0], data: "0x" }] },
        contract,
        wallet,
      ),
      undefined,
    );
    assert.equal(findMessage(receipt, contract, other), undefined);
    assert.throws(
      () => verifyReceipt({ ...receipt, logs: [] }, contract, wallet),
      /MessageLeft/,
    );
  });
});

describe("bounded event pagination", () => {
  it("never reads before deployment and makes at most three queries for empty history", async () => {
    const ranges: { fromBlock: bigint; toBlock: bigint }[] = [];
    const client = {
      getChainId: async () => 11155111,
      getBlockNumber: async () => 10000n,
      getLogs: async (range: { fromBlock: bigint; toBlock: bigint }) => {
        ranges.push(range);
        return [];
      },
    } as unknown as PublicClient;
    const page = await loadLogPage(client, contract, 3000n, 2000n);
    assert.equal(ranges.length, 3);
    assert.equal(page.nextBlock, 4000n);
    assert.deepEqual(
      ranges.map((r) => [r.fromBlock, r.toBlock]),
      [
        [8001n, 10000n],
        [6001n, 8000n],
        [4001n, 6000n],
      ],
    );
    const last = await loadLogPage(
      client,
      contract,
      3000n,
      2000n,
      page.nextBlock,
    );
    assert.equal(last.nextBlock, undefined);
    assert.equal(last.fromBlock, 3000n);
    assert.deepEqual(logWindow(3000n, 3000n, 2000n), {
      fromBlock: 3000n,
      toBlock: 3000n,
    });
  });
  it("does not show a misleading empty book for a wrong RPC or future deployment", async () => {
    const client = {
      getChainId: async () => 1,
      getBlockNumber: async () => 10n,
    } as unknown as PublicClient;
    await assert.rejects(loadLogPage(client, contract, 1n, 5n), /Sepolia/);
    await assert.rejects(
      loadLogPage(
        { ...client, getChainId: async () => 11155111 } as PublicClient,
        contract,
        20n,
        5n,
      ),
      /ahead/,
    );
  });
  it("can ask the RPC for messages from one indexed sender", async () => {
    let senderFilter: Address | undefined;
    const client = {
      getChainId: async () => 11155111,
      getBlockNumber: async () => 3000n,
      getLogs: async (request: { args?: { sender?: Address } }) => {
        senderFilter = request.args?.sender;
        return [];
      },
    } as unknown as PublicClient;

    await loadLogPage(client, contract, 3000n, 2000n, undefined, wallet);

    assert.equal(senderFilter, wallet);
  });
});
