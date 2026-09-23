import { decodeEventLog, isAddressEqual, parseEther, type Address, type Transaction, type TransactionReceipt } from "viem";
import { guestbookAbi } from "./contract";
import { verifyReceipt } from "./receipts";

export const QUEST_TRANSFER_AMOUNT = parseEther("0.001");

export function verifyQuestPair(
  contract: Address,
  deploymentBlock: bigint,
  transfer: Transaction,
  transferReceipt: TransactionReceipt,
  messageTransaction: Transaction,
  messageReceipt: TransactionReceipt,
) {
  if (transfer.hash.toLowerCase() === messageTransaction.hash.toLowerCase())
    throw new Error("Transfer and message must be two distinct transactions.");
  for (const [label, transaction, receipt] of [
    ["Transfer", transfer, transferReceipt],
    ["Message", messageTransaction, messageReceipt],
  ] as const) {
    if (transaction.chainId !== undefined && transaction.chainId !== 11155111)
      throw new Error(`${label} transaction chain ID is not Sepolia.`);
    if (receipt.transactionHash.toLowerCase() !== transaction.hash.toLowerCase())
      throw new Error(`${label} receipt does not match transaction hash.`);
    if (receipt.status !== "success") throw new Error(`${label} transaction did not succeed.`);
    if (receipt.blockNumber < deploymentBlock)
      throw new Error(`${label} transaction predates the configured deployment.`);
  }
  if (!transfer.to || !isAddressEqual(transfer.to, contract) || transfer.input !== "0x")
    throw new Error("Transfer must send ETH directly to the configured contract with empty calldata.");
  if (transfer.value !== QUEST_TRANSFER_AMOUNT)
    throw new Error("Transfer amount must be exactly 0.001 Sepolia ETH.");
  const received = transferReceipt.logs.some((log) => {
    if (!isAddressEqual(log.address, contract)) return false;
    try {
      const event = decodeEventLog({ abi: guestbookAbi, data: log.data, topics: log.topics, strict: true });
      return event.eventName === "TransferReceived" &&
        isAddressEqual(event.args.sender, transfer.from) && event.args.amount === QUEST_TRANSFER_AMOUNT;
    } catch { return false; }
  });
  if (!received) throw new Error("No matching TransferReceived event from the configured contract.");
  if (transferReceipt.blockNumber > messageReceipt.blockNumber ||
      (transferReceipt.blockNumber === messageReceipt.blockNumber &&
       transferReceipt.transactionIndex >= messageReceipt.transactionIndex))
    throw new Error("Transfer must be confirmed before the message transaction.");
  // The event author is authoritative for delegated message calls. Bind it to
  // the independently verified transfer sender, never to its own decoded value.
  return verifyReceipt(messageReceipt, contract, transfer.from);
}
