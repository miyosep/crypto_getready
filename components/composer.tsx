"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useConnection,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { type Address, type Hash } from "viem";
import {
  ArrowUpRight,
  Check,
  CircleCheck,
  ExternalLink,
  LoaderCircle,
  PenLine,
} from "lucide-react";
import {
  byteLength,
  guestbookAbi,
  transactionUrl,
  validateMessage,
} from "@/lib/contract";
import { settings, nftEnabled } from "@/lib/config";
import { friendlyError } from "@/lib/errors";
import type { Locale } from "@/lib/i18n";
import { findMessage } from "@/lib/receipts";
import { WalletPanel } from "./wallet-panel";
import { CompletionGuide } from "./education";
import { QuestNft } from "./quest-nft";
import { TransferStep } from "./transfer-step";

export function Composer({ locale = "zh" }: { locale?: Locale }) {
  const en = locale === "en";
  const { address, chainId, isConnected } = useConnection();
  const client = usePublicClient({ chainId: sepolia.id });
  const queryClient = useQueryClient();
  const write = useWriteContract();
  const [content, setContent] = useState("");
  const [submission, setSubmission] = useState<{
    sender: Address;
    content: string;
  }>();
  const [phase, setPhase] = useState<"idle" | "checking" | "wallet">("idle");
  const [error, setError] = useState<string>();
  const [unresolvedHashes, setUnresolvedHashes] = useState<Hash[]>([]);
  const guard = useRef(false);
  const receipt = useWaitForTransactionReceipt({
    hash: write.data,
    chainId: sepolia.id,
    confirmations: 1,
    timeout: 180000,
    query: { enabled: !!write.data, retry: 1 },
  });
  const event =
    receipt.data && settings.address && submission
      ? findMessage(receipt.data, settings.address, submission.sender)
      : undefined;
  const succeeded =
    receipt.data?.status === "success" &&
    event?.content === submission?.content &&
    !!event;
  const pending = !!write.data && !receipt.data;
  const locked = phase !== "idle" || pending;
  const bytes = byteLength(content);
  const invalid = validateMessage(content, locale);
  const canSubmit =
    settings.ready &&
    isConnected &&
    chainId === sepolia.id &&
    !invalid &&
    !locked &&
    !receipt.data;
  const hash = receipt.data?.transactionHash ?? write.data;

  useEffect(() => {
    if (succeeded) {
      void queryClient.invalidateQueries({ queryKey: ["guestbook"] });
      void queryClient.invalidateQueries({ queryKey: ["balance"] });
    }
  }, [succeeded, queryClient]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (guard.current || !canSubmit || !address || !client || !settings.address)
      return;
    guard.current = true;
    setError(undefined);
    setSubmission({ sender: address, content });
    setPhase("checking");
    try {
      if ((await client.getChainId()) !== sepolia.id)
        throw new Error("RPC chain mismatch");
      const args = {
        address: settings.address,
        abi: guestbookAbi,
        functionName: "leaveMessage",
        args: [content],
        account: address,
      } as const;
      const [{ request }, gas, balance, fees] = await Promise.all([
        client.simulateContract(args),
        client.estimateContractGas(args),
        client.getBalance({ address }),
        client.estimateFeesPerGas(),
      ]);
      const gasWithMargin = (gas * 120n) / 100n;
      const fee = fees.maxFeePerGas ?? fees.gasPrice;
      if (balance < gasWithMargin * fee) {
        setError(
          en
            ? "You do not have enough Sepolia ETH for the estimated gas fee. Get test ETH from a faucet and try again."
            : "Sepolia ETH 不足以支付预计 Gas。请从水龙头领取测试币后重试。",
        );
        return;
      }
      setPhase("wallet");
      await write.mutateAsync({
        ...request,
        gas: gasWithMargin,
        chainId: sepolia.id,
      });
    } catch (cause) {
      setError(friendlyError(cause, locale));
    } finally {
      setPhase("idle");
      guard.current = false;
    }
  }

  function reset() {
    write.reset();
    setError(undefined);
    setSubmission(undefined);
  }

  function recover() {
    if (!write.data || !receipt.isError || receipt.data || receipt.isFetching) return;
    const unresolved = write.data;
    setUnresolvedHashes((previous) =>
      previous.includes(unresolved) ? previous : [...previous, unresolved],
    );
    reset();
  }

  return (
    <section className="composer card" aria-labelledby="composer-title">
      <TransferStep locale={locale} />
      <div className="card-heading">
        <div className="section-kicker">
          <PenLine size={15} /> 02 / MESSAGE
        </div>
        <h2 id="composer-title">{en ? "Leave your first onchain message" : "留下你的第一条链上留言"}</h2>
      </div>
      <WalletPanel locked={locked} locale={locale} />
      {unresolvedHashes.length > 0 && (
        <div className="notice" role="status">
          <p>{en ? "Editing has been restored, but the original transaction was not cancelled and may still succeed. Check it before sending again to avoid a duplicate message." : "已恢复编辑，但这不会取消原交易。原交易仍可能成功；再次发送前请先核对，避免重复留言。"}</p>
          {unresolvedHashes.map((unresolved) => (
            <a key={unresolved} className="hash-text" href={transactionUrl(unresolved)} target="_blank" rel="noreferrer">
              {en ? "View transaction with an unresolved result: " : "查看尚未确认结果的交易："}{unresolved}
            </a>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="message-form">
        <div className="label-row">
          <label htmlFor="message">{en ? "Your message" : "你的留言"}</label>
          <span className="muted">{en ? "Publicly visible · Do not include personal information" : "公开可见 · 请勿填写个人隐私"}</span>
        </div>
        <textarea
          id="message"
          placeholder={en ? "What would you like to say? Keep it simple." : "有什么想说的吗？（简单写一下就好）"}
          value={content}
          disabled={locked || !!receipt.data}
          onChange={(e) => setContent(e.target.value)}
          aria-describedby="byte-count message-help"
          aria-invalid={bytes > 280}
          rows={4}
        />
        <div className="textarea-footer">
          <span id="message-help">{en ? "Most English characters use 1 byte; emoji usually use 4 bytes" : "中文通常占 3 字节，Emoji 通常占 4 字节"}</span>
          <span id="byte-count" className={bytes > 280 ? "warning-text" : ""}>
            {bytes} <span className="muted">/ 280 {en ? "bytes" : "字节"}</span>
          </span>
        </div>
        <div className="examples">
          <span>{en ? "Try one" : "试试这些"}</span>
          {(en ? ["Hello PKU Blockchain!", "I want to learn DeFi"] : ["Hello PKU Blockchain!", "我想学习 DeFi"]).map(
            (example) => (
              <button
                key={example}
                type="button"
                disabled={locked || !!receipt.data}
                onClick={() => setContent(example)}
              >
                {example}
              </button>
            ),
          )}
        </div>
        {bytes > 280 && (
          <p role="alert" className="notice error">
            {invalid}
          </p>
        )}
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="button submit-button"
          disabled={!canSubmit}
        >
          {locked ? (
            <LoaderCircle size={18} className="spin" />
          ) : succeeded ? (
            <Check size={18} />
          ) : (
            <ArrowUpRight size={18} />
          )}
          {phase === "checking"
            ? en ? "Checking transaction…" : "正在检查交易…"
            : phase === "wallet"
              ? en ? "Confirm in MetaMask…" : "请在 MetaMask 中确认…"
              : pending
                ? en ? "Confirming transaction…" : "交易确认中…"
                : succeeded
                  ? en ? "Message recorded" : "留言已写入"
                  : en ? "Write onchain" : "写入链上"}
        </button>
        {isConnected && chainId !== sepolia.id && (
          <p className="submit-caption">{en ? "Switch to Ethereum Sepolia to submit" : "切换到 Ethereum Sepolia 后即可提交"}</p>
        )}
      </form>
      {hash && (
        <div className="transaction-panel" aria-live="polite">
          {succeeded && event && submission ? (
            <>
              <div className="success-title">
                <CircleCheck size={24} />
                <div>
                  <h3>{en ? "Your message is onchain 🎉" : "你的留言已上链 🎉"}</h3>
                  <p>{en ? "The transaction is confirmed. You completed your first smart contract interaction." : "交易已确认，你完成了第一次智能合约交互。"}</p>
                </div>
              </div>
              <blockquote>{event.content}</blockquote>
              {nftEnabled && <QuestNft key={hash} sender={submission.sender} locale={locale} />}
              <dl className="receipt-grid">
                <div>
                  <dt>{en ? "From" : "发送地址（From）"}</dt>
                  <dd title={submission.sender}>{submission.sender}</dd>
                </div>
                <div>
                  <dt>{en ? "Block" : "区块（Block）"}</dt>
                  <dd>{receipt.data?.blockNumber.toString()}</dd>
                </div>
                <div className="full">
                  <dt>{en ? "Transaction Hash" : "交易哈希（Tx Hash）"}</dt>
                  <dd>{hash}</dd>
                </div>
              </dl>
              <p className="muted">
                {en ? "This is the full hash of your message transaction. For your quest submission, also save the transfer transaction hash from the previous step." : "这是留言交易的完整哈希。提交任务时，请同时保存前一步转账的交易哈希。"}
              </p>
            </>
          ) : (
            <>
              <h3>
                {receipt.data
                  ? en ? "This transaction did not record the message" : "这笔交易没有完成留言"
                  : en ? "Transaction sent; waiting for network confirmation" : "交易已发送，等待网络确认"}
              </h3>
              <p>
                {receipt.data?.status === "reverted"
                  ? en ? "The transaction reverted and may have used a small amount of gas. Check your message and try again." : "交易执行失败，可能已消耗少量 Gas。检查留言后可再次尝试。"
                  : receipt.data
                    ? en ? "The transaction may have been cancelled or replaced; your message was not found in the receipt." : "交易可能被取消或替换，回执中没有找到你的这条留言。"
                    : en ? "Confirmation usually takes a few seconds, but may take longer. Do not send it again." : "确认通常需要十几秒，也可能更久。请勿重复发送。"}
              </p>
              <code className="hash-text">{hash}</code>
            </>
          )}
          {receipt.isError && (
            <div className="notice error">
              <p>
                {en ? "The confirmation result is temporarily unavailable. This does not mean the transaction failed. Check Etherscan or try querying again." : "暂时无法取得确认结果，这不代表交易失败。先查看 Etherscan，或继续查询。"}
              </p>
              <button
                type="button"
                className="text-button"
                disabled={receipt.isFetching}
                onClick={() => receipt.refetch()}
              >
                {en ? "Check confirmation again" : "重新查询确认状态"}
              </button>
              {!receipt.data && (
                <button type="button" className="text-button" disabled={receipt.isFetching} onClick={recover}>
                  {en ? "Keep the hash and restore editing" : "保留交易哈希并恢复编辑"}
                </button>
              )}
            </div>
          )}
          <div className="transaction-actions">
            <a
              className="button outline small"
              href={transactionUrl(hash)}
              target="_blank"
              rel="noreferrer"
            >
              {en ? "View on Etherscan" : "在 Etherscan 上查看"} <ExternalLink size={14} />
            </a>
            {receipt.data && !succeeded && (
              <button type="button" className="text-button" onClick={reset}>
                {en ? "Edit the message again" : "重新编辑留言"}
              </button>
            )}
          </div>
          {succeeded && <CompletionGuide locale={locale} />}
        </div>
      )}
    </section>
  );
}
