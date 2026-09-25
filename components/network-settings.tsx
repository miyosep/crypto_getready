"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function NetworkSettings({ locale = "zh" }: { locale?: Locale }) {
  const en = locale === "en";
  const fields = [
    [en ? "Network name" : "网络名称", "Ethereum Sepolia"],
    [en ? "RPC URL" : "RPC 地址", "https://ethereum-sepolia-rpc.publicnode.com"],
    [en ? "Chain ID" : "链 ID", "11155111"],
    [en ? "Currency symbol" : "货币符号", "ETH"],
    [en ? "Block explorer URL" : "区块浏览器地址", "https://sepolia.etherscan.io"],
  ];
  const [copied, setCopied] = useState<string>();
  const [failed, setFailed] = useState(false);
  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setFailed(false);
    } catch {
      setFailed(true);
      setCopied(undefined);
    }
  }
  return (
    <div className="network-settings">
      <dl>
        {fields.map(([label, value]) => (
          <div className="network-field" key={label}>
            <div>
              <dt>{label}</dt>
              <dd>
                <code>{value}</code>
              </dd>
            </div>
            <button
              type="button"
              className="copy-value"
              onClick={() => copy(label, value)}
              aria-label={en ? `Copy ${label}` : `复制${label}`}
            >
              {copied === label ? <Check size={15} /> : <Copy size={15} />}
              {copied === label ? (en ? "Copied" : "已复制") : en ? "Copy" : "复制"}
            </button>
          </div>
        ))}
      </dl>
      <p className="copy-status" role="status">
        {failed
          ? en
            ? "The browser did not allow copying. Select the text above and copy it manually."
            : "浏览器未允许复制。可以选中上面的文字，手动复制。"
          : copied
            ? en
              ? `${copied} copied.`
              : `${copied} 已复制。`
            : en
              ? "Click Copy, then paste the value into MetaMask."
              : "点击复制，将对应的值粘贴到 MetaMask。"}
      </p>
    </div>
  );
}
