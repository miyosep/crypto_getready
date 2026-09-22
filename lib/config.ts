import { parseSettings } from "./settings";

// Enabled only after the NFT-capable contract has been deployed and verified.
export const nftEnabled = process.env.NEXT_PUBLIC_QUEST_NFT_ENABLED === "true";

export const settings = parseSettings({
  address: process.env.NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS,
  block: process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK,
  rpc: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  chunk: process.env.NEXT_PUBLIC_LOG_CHUNK_SIZE,
});

function safeLink(value: string | undefined, fallback: string) {
  try {
    if (value && new URL(value).protocol === "https:") return value;
  } catch {
    /* Use trusted default. */
  }
  return fallback;
}

export const faucets = [
  {
    name: "Google Cloud 水龙头",
    url: safeLink(
      process.env.NEXT_PUBLIC_GOOGLE_FAUCET_URL,
      "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
    ),
  },
  {
    name: "Ethereum.org 水龙头目录",
    url: safeLink(
      process.env.NEXT_PUBLIC_FAUCET_DIRECTORY_URL,
      "https://ethereum.org/en/developers/docs/networks/#sepolia",
    ),
  },
];
