import { config } from "dotenv";
import { createPublicClient, http, type Hash } from "viem";
import { sepolia } from "viem/chains";
import { parseArgs } from "node:util";
import { parseSettings } from "../lib/settings";
import { verifyQuestPair } from "../lib/quest-verification";
import { QUEST_TRANSFER_AMOUNT_ETH } from "../lib/quest";

// Existing shell environment wins; .env.local takes precedence over .env.
config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const { values } = parseArgs({
    options: { "transfer-tx": { type: "string" }, "message-tx": { type: "string" } },
    strict: true,
  });
  function hashArgument(name: "transfer-tx" | "message-tx"): Hash {
    const value = values[name];
    if (!value || !/^0x[0-9a-fA-F]{64}$/.test(value))
      throw new Error(`Provide a valid 32-byte --${name} 0x... hash. Both --transfer-tx and --message-tx are required.`);
    return value as Hash;
  }
  const transferHash = hashArgument("transfer-tx");
  const messageHash = hashArgument("message-tx");
  if (transferHash.toLowerCase() === messageHash.toLowerCase())
    throw new Error("Transfer and message must be two distinct transactions.");
  const rpc = process.env.SEPOLIA_RPC_URL || process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  if (!rpc) throw new Error("Set SEPOLIA_RPC_URL or NEXT_PUBLIC_SEPOLIA_RPC_URL.");
  const settings = parseSettings({
    address: process.env.NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS,
    block: process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK,
    rpc,
  });
  if (!settings.ready || !settings.address || settings.deploymentBlock === undefined)
    throw new Error(`Invalid configuration: ${settings.errors.join("; ")}`);
  const client = createPublicClient({ chain: sepolia, transport: http(rpc, { timeout: 15000, retryCount: 1 }) });
  if ((await client.getChainId()) !== sepolia.id)
    throw new Error("RPC network is not Ethereum Sepolia (11155111).");
  console.log("✓ Ethereum Sepolia network");
  async function readTransaction(hash: Hash, label: string) {
    try {
      const [transaction, receipt] = await Promise.all([
        client.getTransaction({ hash }), client.getTransactionReceipt({ hash }),
      ]);
      return { transaction, receipt };
    } catch {
      throw new Error(`${label} transaction or receipt unavailable: it may be pending, unknown, or the RPC is unavailable. Retry later.`);
    }
  }
  const [transfer, message] = await Promise.all([
    readTransaction(transferHash, "Transfer"), readTransaction(messageHash, "Message"),
  ]);
  const author = verifyQuestPair(settings.address, settings.deploymentBlock,
    transfer.transaction, transfer.receipt, message.transaction, message.receipt);
  console.log(`✓ Transfer: exactly ${QUEST_TRANSFER_AMOUNT_ETH} Sepolia ETH received by the configured contract`);
  console.log("✓ Message: configured contract event matches the transfer sender (direct or delegated call)");
  console.log("✓ Transfer confirmed before message; both receipts succeeded");
  console.log(`Author: ${author.sender}`);
  console.log(`Message: ${JSON.stringify(author.content)}`);
  console.log(`Transfer transaction: ${transferHash}`);
  console.log(`Message transaction: ${messageHash}`);
  console.log("\nQuest verified successfully (transfer + message).");
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : "Verification failed."}`);
  process.exitCode = 1;
});
