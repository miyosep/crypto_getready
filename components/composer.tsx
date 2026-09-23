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
import { type Address } from "viem";
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
import { findMessage } from "@/lib/receipts";
import { WalletPanel } from "./wallet-panel";
import { CompletionGuide } from "./education";
import { QuestNft } from "./quest-nft";

export function Composer() {
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
  const invalid = validateMessage(content);
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
          "Sepolia ETH 不足以支付预计 Gas。请从水龙头领取测试币后重试。",
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
      setError(friendlyError(cause));
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

  return (
    <section className="composer card" aria-labelledby="composer-title">
      <div className="card-heading">
        <div className="section-kicker">
          <PenLine size={15} /> YOUR FIRST ONCHAIN MESSAGE
        </div>
        <h2 id="composer-title">留下你的第一条链上留言</h2>
      </div>
      <WalletPanel locked={locked} />
      <form onSubmit={submit} className="message-form">
        <div className="label-row">
          <label htmlFor="message">你的留言</label>
          <span className="muted">公开可见 · 请勿填写个人隐私</span>
        </div>
        <textarea
          id="message"
          placeholder="有什么想说的吗？（简单写一下就好）
"
          value={content}
          disabled={locked || !!receipt.data}
          onChange={(e) => setContent(e.target.value)}
          aria-describedby="byte-count message-help"
          aria-invalid={bytes > 280}
          rows={4}
        />
        <div className="textarea-footer">
          <span id="message-help">中文通常占 3 字节，Emoji 通常占 4 字节</span>
          <span id="byte-count" className={bytes > 280 ? "warning-text" : ""}>
            {bytes} <span className="muted">/ 280 字节</span>
          </span>
        </div>
        <div className="examples">
          <span>试试这些</span>
          {["Hello PKU Blockchain!", "我想学习 DeFi", ].map(
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
            ? "正在检查交易…"
            : phase === "wallet"
              ? "请在 MetaMask 中确认…"
              : pending
                ? "交易确认中…"
                : succeeded
                  ? "留言已写入"
                  : "写入链上"}
        </button>
        {isConnected && chainId !== sepolia.id && (
          <p className="submit-caption">切换到 Ethereum Sepolia 后即可提交</p>
        )}
      </form>
      {hash && (
        <div className="transaction-panel" aria-live="polite">
          {succeeded && event && submission ? (
            <>
              <div className="success-title">
                <CircleCheck size={24} />
                <div>
                  <h3>你的留言已上链 🎉</h3>
                  <p>交易已确认，你完成了第一次智能合约交互。</p>
                </div>
              </div>
              <blockquote>{event.content}</blockquote>
              {nftEnabled && <QuestNft key={hash} sender={submission.sender} />}
              <dl className="receipt-grid">
                <div>
                  <dt>发送地址（From）</dt>
                  <dd title={submission.sender}>{submission.sender}</dd>
                </div>
                <div>
                  <dt>区块（Block）</dt>
                  <dd>{receipt.data?.blockNumber.toString()}</dd>
                </div>
                <div className="full">
                  <dt>交易哈希（Tx Hash）</dt>
                  <dd>{hash}</dd>
                </div>
              </dl>
              <p className="muted">
                这是留言交易的完整哈希。提交任务时，请同时保存前一步转账的交易哈希。
              </p>
            </>
          ) : (
            <>
              <h3>
                {receipt.data
                  ? "这笔交易没有完成留言"
                  : "交易已发送，等待网络确认"}
              </h3>
              <p>
                {receipt.data?.status === "reverted"
                  ? "交易执行失败，可能已消耗少量 Gas。检查留言后可再次尝试。"
                  : receipt.data
                    ? "交易可能被取消或替换，回执中没有找到你的这条留言。"
                    : "确认通常需要十几秒，也可能更久。请勿重复发送。"}
              </p>
              <code className="hash-text">{hash}</code>
            </>
          )}
          {receipt.isError && (
            <div className="notice error">
              <p>
                暂时无法取得确认结果，这不代表交易失败。先查看
                Etherscan，或继续查询。
              </p>
              <button
                type="button"
                className="text-button"
                disabled={receipt.isFetching}
                onClick={() => receipt.refetch()}
              >
                重新查询确认状态
              </button>
            </div>
          )}
          <div className="transaction-actions">
            <a
              className="button outline small"
              href={transactionUrl(hash)}
              target="_blank"
              rel="noreferrer"
            >
              在 Etherscan 查看 <ExternalLink size={14} />
            </a>
            {receipt.data && !succeeded && (
              <button type="button" className="text-button" onClick={reset}>
                重新编辑留言
              </button>
            )}
          </div>
          {succeeded && <CompletionGuide />}
        </div>
      )}
    </section>
  );
}
