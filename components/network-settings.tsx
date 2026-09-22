"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const fields = [
  ["网络名称 / Network name", "Ethereum Sepolia"],
  ["RPC URL", "https://ethereum-sepolia-rpc.publicnode.com"],
  ["链 ID / Chain ID", "11155111"],
  ["货币符号 / Currency symbol", "ETH"],
  ["区块浏览器 / Block explorer URL", "https://sepolia.etherscan.io"],
];

export function NetworkSettings() {
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
              aria-label={`复制${label}`}
            >
              {copied === label ? <Check size={15} /> : <Copy size={15} />}
              {copied === label ? "已复制" : "复制"}
            </button>
          </div>
        ))}
      </dl>
      <p className="copy-status" role="status">
        {failed
          ? "浏览器未允许复制。可以选中上面的文字，手动复制。"
          : copied
            ? `${copied} 已复制。`
            : "点击复制，将对应的值粘贴到 MetaMask。"}
      </p>
    </div>
  );
}
