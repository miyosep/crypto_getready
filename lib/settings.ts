import { getAddress, isAddress, zeroAddress, type Address } from "viem";

export function parseSettings(raw: {
  address?: string;
  block?: string;
  rpc?: string;
  chunk?: string;
}) {
  const errors: string[] = [];
  let address: Address | undefined;
  let deploymentBlock: bigint | undefined;
  if (
    raw.address &&
    isAddress(raw.address) &&
    raw.address.toLowerCase() !== zeroAddress
  ) {
    address = getAddress(raw.address);
  } else errors.push("合约地址尚未配置或格式不正确");
  if (raw.block && /^[0-9]+$/.test(raw.block))
    deploymentBlock = BigInt(raw.block);
  else errors.push("部署区块尚未配置或格式不正确");
  const rpcUrl = raw.rpc || "https://ethereum-sepolia-rpc.publicnode.com";
  try {
    if (!["https:", "http:"].includes(new URL(rpcUrl).protocol))
      throw new Error();
  } catch {
    errors.push("RPC 地址格式不正确");
  }
  const chunk = Number(raw.chunk || "2000");
  if (!Number.isInteger(chunk) || chunk < 1 || chunk > 10000)
    errors.push("日志区块批次应为 1–10000 的整数");
  return {
    address,
    deploymentBlock,
    rpcUrl,
    chunkSize: BigInt(
      Number.isInteger(chunk) && chunk > 0 && chunk <= 10000 ? chunk : 2000,
    ),
    errors,
    ready: errors.length === 0,
  };
}
