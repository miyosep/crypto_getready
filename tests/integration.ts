import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Abi,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import { guestbookAbi } from "../lib/contract";
import { loadLogPage } from "../lib/logs";
import { verifyReceipt } from "../lib/receipts";

// Local, disposable chain. Uses Anvil's unlocked accounts, never a real private key.
let anvil: ReturnType<typeof spawn> | undefined;
const rpc = "http://127.0.0.1:18545";
const client = createPublicClient({
  chain: sepolia,
  transport: http(rpc, { retryCount: 0 }),
});
const wallet = createWalletClient({
  chain: sepolia,
  transport: http(rpc, { retryCount: 0 }),
});

async function runVerifier(address: string, hash: string, transferHash?: string) {
  return new Promise<{ code: number | null; output: string }>(
    (resolve, reject) => {
      const child = spawn(
        process.execPath,
        [
          "node_modules/tsx/dist/cli.mjs",
          "scripts/verify-quest.ts",
          "--message-tx",
          hash,
          ...(transferHash ? ["--transfer-tx", transferHash] : []),
        ],
        {
          windowsHide: true,
          env: {
            ...process.env,
            SEPOLIA_RPC_URL: rpc,
            NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS: address,
            NEXT_PUBLIC_DEPLOYMENT_BLOCK: "0",
          },
        },
      );
      let output = "";
      child.stdout.on("data", (data) => {
        output += data;
      });
      child.stderr.on("data", (data) => {
        output += data;
      });
      child.on("error", reject);
      child.on("close", (code) => resolve({ code, output }));
    },
  );
}

async function main() {
  try {
    // Refuse to interact with an unrelated chain already listening on the test port.
    await new Promise<void>((resolve, reject) => {
      const probe = createServer();
      probe.once("error", () =>
        reject(new Error("Test port 18545 is already occupied.")),
      );
      probe.listen(18545, "127.0.0.1", () => probe.close(() => resolve()));
    });
    anvil = spawn(
      "anvil",
      [
        "--host",
        "127.0.0.1",
        "--port",
        "18545",
        "--chain-id",
        "11155111",
        "--silent",
      ],
      { windowsHide: true, stdio: "ignore" },
    );
    let spawnError: Error | undefined;
    anvil.on("error", (error) => {
      spawnError = error;
    });
    let ready = false;
    for (let i = 0; i < 40; i++) {
      if (spawnError) throw spawnError;
      if (anvil.exitCode !== null)
        throw new Error("Anvil exited before becoming ready.");
      try {
        await client.getChainId();
        ready = true;
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!ready)
      throw new Error("Anvil failed to start on dedicated test port 18545.");
    const [account, secondAccount] = await wallet.getAddresses();
    const artifact = JSON.parse(
      await readFile(
        "contracts/out/PKUBAGetReady.sol/PKUBAGetReady.json",
        "utf8",
      ),
    ) as { abi: Abi; bytecode: { object: Hex } };
    const deployed = await client.waitForTransactionReceipt({
      hash: await wallet.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode.object,
        account,
      }),
    });
    assert.ok(deployed.contractAddress);
    const address = deployed.contractAddress;
    const transferHash = await wallet.sendTransaction({ account, to: address, value: parseEther("0.001") });
    await client.waitForTransactionReceipt({ hash: transferHash });
    const content = "你好 PKUBA! 我想学习 ZK。";
    const { request } = await client.simulateContract({
      account,
      address,
      abi: guestbookAbi,
      functionName: "leaveMessage",
      args: [content],
    });
    const hash = await wallet.writeContract(request);
    const receipt = await client.waitForTransactionReceipt({ hash });
    assert.equal(verifyReceipt(receipt, address, account).content, content);
    const tokenId = await client.readContract({ address, abi: guestbookAbi, functionName: "tokenOf", args: [account] });
    assert.equal(tokenId, 1n);
    assert.equal((await client.readContract({ address, abi: guestbookAbi, functionName: "ownerOf", args: [tokenId] })).toLowerCase(), account.toLowerCase());
    const uri = await client.readContract({ address, abi: guestbookAbi, functionName: "tokenURI", args: [tokenId] });
    const metadata = JSON.parse(Buffer.from(uri.split(",")[1], "base64").toString("utf8"));
    assert.equal(metadata.name, "PKUBA Get Ready #1");
    assert.equal(Buffer.from(metadata.image.split(",")[1], "base64").toString("utf8"), (await readFile("public/quest-nft.svg", "utf8")).trim().replace("0x22c2...06c6", `${account.slice(0, 6).toLowerCase()}...${account.slice(-4).toLowerCase()}`));
    const repeatHash = await wallet.writeContract({
      account,
      address,
      abi: guestbookAbi,
      functionName: "leaveMessage",
      args: ["Second message"],
    });
    await client.waitForTransactionReceipt({ hash: repeatHash });
    assert.equal(await client.readContract({ address, abi: guestbookAbi, functionName: "totalMinted" }), 1n);
    const page = await loadLogPage(client, address, deployed.blockNumber, 1n);
    assert.deepEqual(
      page.messages.map((message) => message.content),
      ["Second message", content],
    );
    await assert.rejects(
      client.simulateContract({
        account,
        address,
        abi: guestbookAbi,
        functionName: "leaveMessage",
        args: [""],
      }),
    );
    const verified = await runVerifier(address, hash, transferHash);
    assert.equal(verified.code, 0, verified.output);
    assert.match(verified.output, /transfer \+ message/);
    const missingTransfer = await runVerifier(address, hash);
    assert.equal(missingTransfer.code, 1);
    assert.match(missingTransfer.output, /--transfer-tx/);
    const reusedHash = await runVerifier(address, hash, hash);
    assert.equal(reusedHash.code, 1);
    assert.match(reusedHash.output, /distinct/);
    const wrongRecipient = await wallet.sendTransaction({
      account,
      to: secondAccount,
      value: parseEther("0.001"),
    });
    await client.waitForTransactionReceipt({ hash: wrongRecipient });
    const transfer = await runVerifier(address, hash, wrongRecipient);
    assert.equal(transfer.code, 1, transfer.output);
    assert.match(transfer.output, /directly to the configured contract/);
    const wrongAmount = await wallet.sendTransaction({ account, to: address, value: 1n });
    await client.waitForTransactionReceipt({ hash: wrongAmount });
    const amountResult = await runVerifier(address, hash, wrongAmount);
    assert.equal(amountResult.code, 1);
    assert.match(amountResult.output, /exactly 0.001/);
    const otherMessage = await wallet.writeContract({ account: secondAccount, address, abi: guestbookAbi, functionName: "leaveMessage", args: ["Different author"] });
    await client.waitForTransactionReceipt({ hash: otherMessage });
    const mismatched = await runVerifier(address, otherMessage, transferHash);
    assert.equal(mismatched.code, 1);
    assert.match(mismatched.output, /MessageLeft/);
    const lateTransfer = await wallet.sendTransaction({ account, to: address, value: parseEther("0.001") });
    await client.waitForTransactionReceipt({ hash: lateTransfer });
    const late = await runVerifier(address, hash, lateTransfer);
    assert.equal(late.code, 1);
    assert.match(late.output, /before the message/);
    console.log(
      "✓ Local Anvil: deployment, NFT artwork, messages, logs, two-transaction verification; missing/duplicate hashes, wrong recipient/amount/author/order rejected.",
    );
  } finally {
    anvil?.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
