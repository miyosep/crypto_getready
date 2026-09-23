"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { settings } from "@/lib/config";

export function TransferStep() {
  const [status, setStatus] = useState("");
  async function copyAddress() {
    if (!settings.address) return;
    try {
      await navigator.clipboard.writeText(settings.address);
      setStatus("地址已复制");
    } catch {
      setStatus("复制失败，请选中地址手动复制。");
    }
  }
  return (
    <section className="transfer-step" aria-labelledby="transfer-title">
      <div className="section-kicker">01 / TRANSFER</div>
      <h2 id="transfer-title">先发送一笔测试币</h2>
      <p>在 MetaMask 中切换到 Ethereum Sepolia，点击 Send，向下面的地址发送 <strong>0.001 ETH</strong>。</p>
      {settings.address ? (
        <div className="transfer-address">
          <div>
            <span className="muted">收款合约地址</span>
            <a href={`https://sepolia.etherscan.io/address/${settings.address}`} target="_blank" rel="noreferrer">
              <code>{settings.address}</code>
            </a>
          </div>
          <button className="copy-value" type="button" onClick={copyAddress} aria-label="复制收款合约地址">
            {status === "地址已复制" ? <Check size={15} /> : <Copy size={15} />}
            {status === "地址已复制" ? "已复制" : "复制地址"}
          </button>
        </div>
      ) : <p role="alert">收款地址尚未配置，请稍后再试。</p>}
      <span className="transfer-copy-status" role="status">{status}</span>
      <p className="muted">转账成功后保存 Tx Hash，再继续下面的留言步骤。</p>
    </section>
  );
}
