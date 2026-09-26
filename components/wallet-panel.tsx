"use client";

import { useRef, useState } from "react";
import {
  useBalance,
  useConnect,
  useConnection,
  useConfig,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { formatEther, parseEther } from "viem";
import { Check, LoaderCircle, Wallet } from "lucide-react";
import { shortAddress } from "@/lib/contract";
import { friendlyError } from "@/lib/errors";
import type { Locale } from "@/lib/i18n";
import { QUEST_TRANSFER_AMOUNT_ETH } from "@/lib/quest";
import { findMetaMaskConnector } from "@/lib/wallet-discovery";

export function WalletPanel({
  locked,
  locale = "zh",
}: {
  locked: boolean;
  locale?: Locale;
}) {
  const en = locale === "en";
  const { address, chainId, isConnected, isReconnecting } = useConnection();
  const config = useConfig();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();
  const balance = useBalance({
    address,
    chainId: sepolia.id,
    query: { enabled: isConnected, refetchInterval: 15000 },
  });
  const [missing, setMissing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [connectionError, setConnectionError] = useState<string>();
  const connecting = useRef(false);
  const wrongNetwork = isConnected && chainId !== sepolia.id;
  const lowBalance =
    balance.data &&
    balance.data.value < parseEther(QUEST_TRANSFER_AMOUNT_ETH);
  async function connectWallet() {
    if (connecting.current) return;
    connecting.current = true;
    setChecking(true);
    setMissing(false);
    setConnectionError(undefined);
    connect.reset();
    try {
      const connector = await findMetaMaskConnector(() => config.connectors);
      if (!connector) {
        setMissing(true);
        return;
      }
      setChecking(false);
      await connect.mutateAsync({ connector });
    } catch (error) {
      setConnectionError(friendlyError(error, locale));
    } finally {
      setChecking(false);
      connecting.current = false;
    }
  }
  return (
    <div className="wallet-section" id="wallet">
      <div className="wallet-row">
        <div className="wallet-label">
          <span className="icon-tile">
            <Wallet size={20} />
          </span>
          <div>
            <strong>
              {address
                ? shortAddress(address)
                : en
                  ? "Start with your wallet"
                  : "从你的钱包开始"}
            </strong>
            <p>
              {isConnected
                ? en
                  ? "Your public onchain identity"
                  : "你的公开链上身份"
                : en
                  ? "Connecting does not send a transaction or charge a fee"
                  : "连接钱包不会发起交易，也不会扣费"}
            </p>
          </div>
        </div>
        {isConnected ? (
          <button
            className="text-button"
            disabled={locked}
            onClick={() => disconnect.mutate({})}
          >
            {en ? "Disconnect" : "断开连接"}
          </button>
        ) : (
          <button
            className="button small"
            onClick={connectWallet}
            disabled={checking || connect.isPending || isReconnecting}
          >
            {checking || connect.isPending || isReconnecting ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Wallet size={16} />
            )}
            {checking
              ? en
                ? "Looking for MetaMask…"
                : "正在查找 MetaMask…"
              : connect.isPending
              ? en
                ? "Connect in MetaMask"
                : "请在 MetaMask 中连接"
              : isReconnecting
                ? en
                  ? "Restoring connection…"
                  : "恢复连接中"
                : en
                  ? "Connect wallet"
                  : "连接钱包"}
          </button>
        )}
      </div>
      {isConnected && (
        <div className={`network-row ${wrongNetwork ? "warning-text" : ""}`}>
          <span>
            {wrongNetwork ? (
              en
                ? "Wrong network. Switch to Ethereum Sepolia"
                : "网络不正确，请切换到 Ethereum Sepolia"
            ) : (
              <>
                <Check size={14} /> Ethereum Sepolia
              </>
            )}
          </span>
          {!wrongNetwork && balance.data && (
            <span>
              {Number(formatEther(balance.data.value)).toFixed(5)} Sepolia ETH
            </span>
          )}
          {wrongNetwork && (
            <button
              className="text-button"
              disabled={locked || switchChain.isPending}
              onClick={() => switchChain.mutate({ chainId: sepolia.id })}
            >
              {switchChain.isPending
                ? en
                  ? "Switching…"
                  : "切换中…"
                : en
                  ? "Switch to Sepolia"
                  : "切换到 Sepolia"}
            </button>
          )}
        </div>
      )}
      {missing && (
        <p className="notice">
          {en
            ? "MetaMask was not detected. If it is installed, make sure the extension is enabled in this browser profile and allowed to access this site, then refresh. Use a regular window; private windows require separate extension permission. Not installed yet? "
            : "当前页面未检测到 MetaMask。如果已安装，请确认当前浏览器配置文件已启用扩展，并允许 MetaMask 访问本站，然后刷新重试。请使用普通窗口；InPrivate / 无痕窗口需要另外允许扩展运行。尚未安装？ "}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noreferrer"
          >
            {en ? "Install MetaMask ↗" : "安装 MetaMask ↗"}
          </a>
        </p>
      )}
      {(connectionError || switchChain.error) && (
        <p className="notice error" role="alert">
          {connectionError || friendlyError(switchChain.error, locale)}
        </p>
      )}
      {isConnected && balance.isError && (
        <p className="notice">
          {en
            ? "The test ETH balance is temporarily unavailable. "
            : "暂时无法读取测试币余额。"}
          <button className="text-button" onClick={() => balance.refetch()}>
            {en ? "Try again" : "重新读取"}
          </button>
        </p>
      )}
      {isConnected && lowBalance && (
        <p className="notice">
          {en
            ? `Your balance is below the required ${QUEST_TRANSFER_AMOUNT_ETH} Sepolia ETH transfer amount. You will also need a little extra for gas.`
            : `你的余额不足任务要求的 ${QUEST_TRANSFER_AMOUNT_ETH} Sepolia ETH 转账金额，另外还需要留少量测试币支付手续费（Gas）。`}
        </p>
      )}
    </div>
  );
}
