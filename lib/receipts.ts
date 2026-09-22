import {
  decodeEventLog,
  isAddressEqual,
  type Address,
  type TransactionReceipt,
} from "viem";
import { guestbookAbi } from "./contract";

export function findMessage(
  receipt: Pick<TransactionReceipt, "logs">,
  contract: Address,
  sender?: Address,
) {
  for (const log of receipt.logs) {
    if (!isAddressEqual(log.address, contract)) continue;
    try {
      const event = decodeEventLog({
        abi: guestbookAbi,
        data: log.data,
        topics: log.topics,
        strict: true,
      });
      if (
        event.eventName === "MessageLeft" &&
        (!sender || isAddressEqual(event.args.sender, sender))
      )
        return event.args;
    } catch {
      /* Ignore unrelated or malformed logs; never treat them as completion. */
    }
  }
}

export function verifyReceipt(
  receipt: TransactionReceipt,
  contract: Address,
  wallet: Address,
) {
  if (receipt.status !== "success")
    throw new Error("Transaction did not succeed.");
  const message = findMessage(receipt, contract, wallet);
  if (!message)
    throw new Error(
      "No MessageLeft event from the PKUBA contract matches the submitted wallet.",
    );
  return message;
}
