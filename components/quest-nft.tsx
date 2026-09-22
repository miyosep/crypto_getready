"use client";

import Image from "next/image";
import { useReadContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { isAddressEqual, type Address } from "viem";
import { guestbookAbi } from "@/lib/contract";
import { settings } from "@/lib/config";

export function QuestNft({ sender }: { sender: Address }) {
  const token = useReadContract({
    address: settings.address,
    abi: guestbookAbi,
    functionName: "tokenOf",
    args: [sender],
    chainId: sepolia.id,
    query: { staleTime: 0, refetchOnMount: "always" },
  });
  const owner = useReadContract({
    address: settings.address,
    abi: guestbookAbi,
    functionName: "ownerOf",
    args: [token.data ?? 0n],
    chainId: sepolia.id,
    query: { enabled: !!token.data, staleTime: 0, refetchOnMount: "always" },
  });
  const metadata = useReadContract({
    address: settings.address,
    abi: guestbookAbi,
    functionName: "tokenURI",
    args: [token.data ?? 0n],
    chainId: sepolia.id,
    query: { enabled: !!token.data },
  });
  let image: string | undefined;
  if (metadata.data) {
    try {
      const prefix = "data:application/json;base64,";
      if (metadata.data.startsWith(prefix)) {
        const parsed = JSON.parse(atob(metadata.data.slice(prefix.length)));
        if (typeof parsed.image === "string" && parsed.image.startsWith("data:image/svg+xml;base64,")) image = parsed.image;
      }
    } catch { /* Show a retry instead of a misleading sample ticket. */ }
  }
  if (token.isError || owner.isError || metadata.isError || (metadata.data && !image)) {
    return <p className="muted">留言已成功，NFT 信息暂时无法读取。
      <button type="button" className="text-button" onClick={() => { void token.refetch(); void owner.refetch(); void metadata.refetch(); }}>重新查询 NFT</button>
    </p>;
  }
  if (!token.data || !owner.data || !image) return <p className="muted">正在确认纪念 NFT…</p>;
  const held = isAddressEqual(owner.data, sender);
  return (
    <div className="quest-nft">
      <Image src={image} alt={`PKUBA Get Ready #${token.data} 纪念 NFT`} width={160} height={160} style={{ objectFit: "contain" }} unoptimized />
      <div>
        <h3>{held ? "你的 Get Ready 纪念 NFT" : "你已领取过纪念 NFT"}</h3>
        <p>PKUBA Get Ready #{token.data.toString()}</p>
        <p className="muted">{held ? "已发放至你的钱包，无需另外领取。每个地址首次留言可获得一枚。" : "这枚 NFT 已转出，重复留言不会再次发放。"}</p>
        <a href={`https://sepolia.etherscan.io/token/${settings.address}?a=${token.data}`} target="_blank" rel="noreferrer">在 Etherscan 查看 NFT ↗</a>
      </div>
    </div>
  );
}
