import { parseAbi } from "viem";

export const MAX_MESSAGE_BYTES = 280;
export const guestbookAbi = parseAbi([
  "function leaveMessage(string content)",
  "event MessageLeft(address indexed sender, string content, uint256 timestamp)",
  "error EmptyMessage()",
  "error MessageTooLong()",
  "function tokenOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
  "function totalMinted() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);
export const messageEvent = guestbookAbi[1];
export const byteLength = (text: string) =>
  new TextEncoder().encode(text).length;
export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;
export const transactionUrl = (hash: string) =>
  `https://sepolia.etherscan.io/tx/${hash}`;

export function validateMessage(content: string): string | undefined {
  if (!content.trim()) return "写点什么吧，让大家认识你。";
  if (byteLength(content) > MAX_MESSAGE_BYTES)
    return "留言超过了 280 字节，请稍微精简一下。";
}
