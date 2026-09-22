import { config } from "dotenv";
import { createPublicClient, http, type Hash } from "viem";
import { sepolia } from "viem/chains";
import { parseArgs } from "node:util";
import { parseSettings } from "../lib/settings";
import { findMessage, verifyReceipt } from "../lib/receipts";

// Existing shell environment wins; .env.local takes precedence over .env.
config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const { values } = parseArgs({
    options: { tx: { type: "string" } },
    strict: true,
  });
  if (!values.tx || !/^0x[0-9a-fA-F]{64}$/.test(values.tx))
    throw new Error("Provide a valid 32-byte --tx 0x... hash.");
  const rpc =
    process.env.SEPOLIA_RPC_URL || process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  if (!rpc)
    throw new Error("Set SEPOLIA_RPC_URL or NEXT_PUBLIC_SEPOLIA_RPC_URL.");
  const settings = parseSettings({
    address: process.env.NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS,
    block: process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK,
    rpc,
  });
  if (!settings.ready || !settings.address)
    throw new Error(`Invalid configuration: ${settings.errors.join("; ")}`);
  const client = createPublicClient({
    chain: sepolia,
    transport: http(rpc, { timeout: 15000, retryCount: 1 }),
  });
  if ((await client.getChainId()) !== sepolia.id)
    throw new Error("RPC network is not Ethereum Sepolia (11155111).");
  console.log("✓ Ethereum Sepolia network");
  let transaction;
  try {
    transaction = await client.getTransaction({ hash: values.tx as Hash });
  } catch {
    throw new Error(
      "Transaction not found on this Sepolia RPC, or RPC is unavailable.",
    );
  }
  if (transaction.chainId !== undefined && transaction.chainId !== sepolia.id)
    throw new Error("Transaction chain ID is not Sepolia.");
  console.log("✓ Transaction found");
  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash: values.tx as Hash });
  } catch {
    throw new Error(
      "No receipt yet: transaction may still be pending, or RPC is unavailable. Retry later.",
    );
  }
  if (receipt.status !== "success")
    throw new Error("Transaction reverted onchain.");
  console.log("✓ Transaction succeeded");
  const emitted = findMessage(receipt, settings.address);
  if (!emitted) throw new Error("No MessageLeft event from the configured PKUBA contract.");
  const message = verifyReceipt(receipt, settings.address, emitted.sender);
  console.log("✓ Correct PKUBA event emitter (direct or delegated call)");
  console.log("✓ MessageLeft event found");
  console.log(`Author: ${message.sender}`);
  console.log(`\nMessage: ${JSON.stringify(message.content)}`);
  console.log(`Block: ${receipt.blockNumber}`);
  console.log(`Transaction: ${receipt.transactionHash}`);
  console.log("\nQuest verified successfully.");
}

main().catch((error) => {
  console.error(
    `✗ ${error instanceof Error ? error.message : "Verification failed."}`,
  );
  process.exitCode = 1;
});
