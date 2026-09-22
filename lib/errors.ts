import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";

export function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const cause = error instanceof BaseError ? error.walk() : error;
  if (
    (typeof cause === "object" && cause !== null && "code" in cause && cause.code === -32002) ||
    /already pending|request.*pending|-32002|resource.*unavailable/.test(message)
  )
    return "MetaMask 中已有待处理的请求。请点击浏览器工具栏中的 MetaMask 图标，完成或取消该请求后再试。";
  if (
    cause instanceof UserRejectedRequestError ||
    /user rejected|user denied|4001/.test(message)
  )
    return "你取消了钱包请求，没有新的交易发出。准备好后可以再试一次。";
  if (
    cause instanceof InsufficientFundsError ||
    /insufficient funds|exceeds the balance/.test(message)
  )
    return "Sepolia ETH 不足以支付这次 Gas。先从下方水龙头领取一些测试币，再试一次。";
  if (cause instanceof ContractFunctionRevertedError || /revert/.test(message))
    return "智能合约没有接受这条留言。请检查内容是否为空，或是否超过 280 字节。";
  if (/chain|network mismatch/.test(message))
    return "当前网络不正确，请在钱包中切换到 Ethereum Sepolia。";
  if (/provider.*not found|connector.*not found/.test(message))
    return "当前页面无法访问 MetaMask。请检查当前浏览器配置文件中的扩展和本站访问权限，然后刷新重试。";
  return "暂时无法连接测试网络。请检查网络后重试；若已经获得交易哈希，请先在 Etherscan 查看，避免重复提交。";
}
