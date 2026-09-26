"use client";

import { settings } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import { QUEST_TRANSFER_AMOUNT_LABEL } from "@/lib/quest";
import { ContractAddress } from "./contract-address";

export function TransferStep({ locale = "zh" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <section className="transfer-step" aria-labelledby="transfer-title">
      <div className="section-kicker">01 / TRANSFER</div>
      <h2 id="transfer-title">{en ? "First, send test ETH" : "先发送一笔测试币"}</h2>
      <p>
        {en ? "In MetaMask, switch to " : "在 MetaMask 中切换到 "}
        <strong>{en ? "Sepolia Testnet" : "Sepolia 测试网"}</strong>
        {en ? ", click Send, and send " : "，点击“发送”，向下面的地址发送 "}
        <strong>{QUEST_TRANSFER_AMOUNT_LABEL}</strong>{en ? " to the address below." : "。"}
      </p>
      {settings.address ? (
        <ContractAddress address={settings.address} label={en ? "Receiving contract address" : "收款合约地址"} locale={locale} />
      ) : <p role="alert">{en ? "The receiving address is not configured yet." : "收款地址尚未配置，请稍后再试。"}</p>}
      {settings.address && (
        <p className="muted">
          {en
            ? "This is a “special address” deployed by the association on Sepolia—a smart contract address. It is not anyone’s personal wallet; it receives the quest transfer and records the interaction."
            : "这是协会部署在 Sepolia 测试网上的一个“特殊地址”，也就是智能合约地址。它不是某个人的钱包，而是用来接收本次任务转账并记录交互。"}
        </p>
      )}
      <p className="muted">
        {en ? "After the transfer succeeds, save the " : "转账成功后保存"}
        <strong>{en ? "transaction hash" : "交易哈希（Transaction Hash）"}</strong>
        {en ? ", then continue to the message step below." : "，再继续下面的留言步骤。"}
      </p>
    </section>
  );
}
