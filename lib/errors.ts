import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";
import type { Locale } from "./i18n";

export function friendlyError(error: unknown, locale: Locale = "zh"): string {
  const en = locale === "en";
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const cause = error instanceof BaseError ? error.walk() : error;
  if (
    (typeof cause === "object" && cause !== null && "code" in cause && cause.code === -32002) ||
    /already pending|request.*pending|-32002|resource.*unavailable/.test(message)
  )
    return en
      ? "MetaMask already has a pending request. Open MetaMask from your browser toolbar, complete or cancel it, then try again."
      : "MetaMask 中已有待处理的请求。请点击浏览器工具栏中的 MetaMask 图标，完成或取消该请求后再试。";
  if (
    cause instanceof UserRejectedRequestError ||
    /user rejected|user denied|4001/.test(message)
  )
    return en
      ? "You cancelled the wallet request. No new transaction was sent. Try again when you are ready."
      : "你取消了钱包请求，没有新的交易发出。准备好后可以再试一次。";
  if (
    cause instanceof InsufficientFundsError ||
    /insufficient funds|exceeds the balance/.test(message)
  )
    return en
      ? "You do not have enough Sepolia ETH for gas. Get some test ETH from a faucet and try again."
      : "Sepolia ETH 不足以支付这次 Gas。先从下方水龙头领取一些测试币，再试一次。";
  if (cause instanceof ContractFunctionRevertedError || /revert/.test(message))
    return en
      ? "The smart contract rejected this message. Check that it is not empty or over 280 bytes."
      : "智能合约没有接受这条留言。请检查内容是否为空，或是否超过 280 字节。";
  if (/chain|network mismatch/.test(message))
    return en
      ? "Wrong network. Switch your wallet to Ethereum Sepolia."
      : "当前网络不正确，请在钱包中切换到 Ethereum Sepolia。";
  if (/provider.*not found|connector.*not found/.test(message))
    return en
      ? "This page cannot access MetaMask. Check the extension and its site permissions in this browser profile, then refresh."
      : "当前页面无法访问 MetaMask。请检查当前浏览器配置文件中的扩展和本站访问权限，然后刷新重试。";
  return en
    ? "The test network is temporarily unavailable. Check your connection and try again. If you already have a transaction hash, check Etherscan first to avoid submitting twice."
    : "暂时无法连接测试网络。请检查网络后重试；若已经获得交易哈希，请先在 Etherscan 查看，避免重复提交。";
}
