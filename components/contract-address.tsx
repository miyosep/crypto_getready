"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { addressUrl, blockscoutAddressUrl } from "@/lib/contract";
import type { Locale } from "@/lib/i18n";

type ContractAddressProps = {
  address: string;
  label?: string;
  locale?: Locale;
};

export function ContractAddress({
  address,
  label,
  locale = "zh",
}: ContractAddressProps) {
  const en = locale === "en";
  const displayLabel = label ?? (en ? "Contract address" : "合约地址");
  const [status, setStatus] = useState("");

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setStatus(en ? "Address copied" : "地址已复制");
    } catch {
      setStatus(
        en
          ? "Copy failed. Select the address and copy it manually."
          : "复制失败，请选中地址手动复制",
      );
    }
  }

  return (
    <div className="contract-address">
      <span className="contract-address-label">{displayLabel}</span>
      <div className="contract-address-actions">
        <button
          className="contract-address-copy"
          type="button"
          onClick={copyAddress}
          aria-label={en ? `Copy ${displayLabel}` : `复制${displayLabel}`}
          title={en ? "Click to copy address" : "点击复制地址"}
        >
          <code>{address}</code>
          {status === (en ? "Address copied" : "地址已复制") ? (
            <Check size={15} />
          ) : (
            <Copy size={15} />
          )}
        </button>
        <a
          className="contract-explorer-link"
          href={addressUrl(address)}
          target="_blank"
          rel="noreferrer"
        >
          {en ? "View on Etherscan" : "在 Etherscan 上查看"}{" "}
          <ExternalLink size={14} />
        </a>
        <a
          className="contract-explorer-link secondary"
          href={blockscoutAddressUrl(address)}
          target="_blank"
          rel="noreferrer"
        >
          {en ? "Blockscout backup" : "Blockscout 备用入口"}{" "}
          <ExternalLink size={14} />
        </a>
      </div>
      <span className="contract-copy-status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
