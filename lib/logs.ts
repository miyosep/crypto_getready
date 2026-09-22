import { type Address, type Hash, type PublicClient } from "viem";
import { messageEvent } from "./contract";

export type GuestbookMessage = {
  sender: Address;
  content: string;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
  logIndex: number;
};
export type LogPage = {
  messages: GuestbookMessage[];
  nextBlock?: bigint;
  fromBlock: bigint;
  toBlock: bigint;
};

export function logWindow(to: bigint, deployment: bigint, chunk: bigint) {
  if (chunk < 1n) throw new Error("Invalid block chunk size");
  const from = to - chunk + 1n;
  return { fromBlock: from > deployment ? from : deployment, toBlock: to };
}

// A page uses at most three bounded requests. Sparse histories stay bounded too.
export async function loadLogPage(
  client: PublicClient,
  address: Address,
  deployment: bigint,
  chunk: bigint,
  cursor?: bigint,
): Promise<LogPage> {
  if ((await client.getChainId()) !== 11155111)
    throw new Error("RPC chain is not Sepolia");
  const head = cursor ?? (await client.getBlockNumber({ cacheTime: 0 }));
  if (head < deployment)
    throw new Error("Deployment block is ahead of the chain head");
  let end = head;
  let start = head;
  let finished = false;
  const messages: GuestbookMessage[] = [];
  for (let i = 0; i < 3; i++) {
    const range = logWindow(end, deployment, chunk);
    start = range.fromBlock;
    const logs = await client.getLogs({
      address,
      event: messageEvent,
      ...range,
      strict: true,
    });
    for (const log of logs) {
      if (
        log.removed ||
        log.blockNumber === null ||
        log.transactionHash === null ||
        log.logIndex === null
      )
        continue;
      messages.push({
        ...log.args,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
      });
    }
    if (start === deployment) {
      finished = true;
      break;
    }
    end = start - 1n;
    if (messages.length >= 20) break;
  }
  messages.sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? b.logIndex - a.logIndex
      : a.blockNumber > b.blockNumber
        ? -1
        : 1,
  );
  return {
    messages,
    fromBlock: start,
    toBlock: head,
    nextBlock: finished ? undefined : start - 1n,
  };
}
