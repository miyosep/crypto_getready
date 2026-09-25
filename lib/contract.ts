import { parseAbi } from "viem";
import type { Locale } from "./i18n";

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
  "event TransferReceived(address indexed sender, uint256 amount)",
]);
export const messageEvent = guestbookAbi[1];
export const byteLength = (text: string) =>
  new TextEncoder().encode(text).length;
export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;
export const transactionUrl = (hash: string) =>
  `https://sepolia.etherscan.io/tx/${hash}`;

export function validateMessage(
  content: string,
  locale: Locale = "zh",
): string | undefined {
  if (!content.trim())
    return locale === "en"
      ? "Write something so the community can get to know you."
      : "写点什么吧，让大家认识你。";
  if (byteLength(content) > MAX_MESSAGE_BYTES)
    return locale === "en"
      ? "Your message is over 280 bytes. Please shorten it."
      : "留言超过了 280 字节，请稍微精简一下。";
}
