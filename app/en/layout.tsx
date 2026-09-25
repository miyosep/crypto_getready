import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PKUBA Get Ready · Fall 2026",
  description:
    "A beginner-friendly Ethereum quest: create a wallet, get Sepolia test ETH, make a transfer, and leave your first onchain message.",
};

export default function EnglishLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div lang="en">{children}</div>;
}
