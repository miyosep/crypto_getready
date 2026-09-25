import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MyMessages } from "../components/my-messages";

const wallet = "0x2222222222222222222222222222222222222222" as const;
const hash = `0x${"a".repeat(64)}` as const;

vi.mock("@/lib/config", () => ({
  settings: {
    ready: true,
    address: "0x1111111111111111111111111111111111111111",
    deploymentBlock: 1n,
    chunkSize: 2_000n,
    rpcUrl: "https://example.test",
  },
}));
vi.mock("wagmi", () => ({ usePublicClient: () => ({}) }));
vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: () => ({
    data: {
      pages: [
        {
          messages: [
            {
              sender: wallet,
              content: "你好，区块链！",
              timestamp: 1_790_000_000n,
              blockNumber: 100n,
              transactionHash: hash,
              logIndex: 0,
            },
          ],
        },
      ],
    },
    error: undefined,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchNextPageError: false,
    isFetching: false,
    isFetchingNextPage: false,
    isPending: false,
    isSuccess: true,
    refetch: vi.fn(),
  }),
}));

afterEach(cleanup);

it("shows the connected wallet's message with an Etherscan transaction link", () => {
  render(<MyMessages address={wallet} />);

  expect(screen.getByText("你好，区块链！")).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "在 Etherscan 上查看" }).getAttribute("href"),
  ).toBe(`https://sepolia.etherscan.io/tx/${hash}`);
});
