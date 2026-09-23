import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Composer } from "../components/composer";
import { QuestNft } from "../components/quest-nft";

const state = vi.hoisted(() => ({
  hash: `0x${"a".repeat(64)}` as `0x${string}`,
  wallet: "0x2222222222222222222222222222222222222222" as `0x${string}`,
  receiptError: true,
  receiptFetching: false,
  token: 0n as bigint | undefined,
  tokenError: false,
  tokenFetching: false,
  tokenRetry: vi.fn(), ownerRetry: vi.fn(), metadataRetry: vi.fn(), receiptRetry: vi.fn(),
}));

vi.mock("@/lib/config", () => ({ settings: { ready: true, address: "0x1111111111111111111111111111111111111111" }, nftEnabled: true }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock("../components/wallet-panel", () => ({ WalletPanel: () => null }));
vi.mock("../components/education", () => ({ CompletionGuide: () => null }));
vi.mock("../components/transfer-step", () => ({ TransferStep: () => null }));
vi.mock("wagmi", async () => {
  const { useState } = await import("react");
  return {
    useConnection: () => ({ address: state.wallet, chainId: 11155111, isConnected: true }),
    usePublicClient: () => ({}),
    useWriteContract: function useWriteContract() {
      const [data, setData] = useState<string | undefined>(state.hash);
      return { data, reset: () => setData(undefined), mutateAsync: vi.fn() };
    },
    useWaitForTransactionReceipt: ({ hash }: { hash?: string }) => ({
      data: undefined, isError: !!hash && state.receiptError,
      isFetching: !!hash && state.receiptFetching, refetch: state.receiptRetry,
    }),
    useReadContract: ({ functionName }: { functionName: string }) => {
      if (functionName === "tokenOf") return {
        data: state.token, isSuccess: state.token !== undefined && !state.tokenError,
        isError: state.tokenError, isFetching: state.tokenFetching, refetch: state.tokenRetry,
      };
      if (functionName === "ownerOf") return { data: state.token ? state.wallet : undefined, refetch: state.ownerRetry };
      return { data: state.token ? `data:application/json;base64,${btoa(JSON.stringify({ image: "data:image/svg+xml;base64,PHN2Zy8+" }))}` : undefined, refetch: state.metadataRetry };
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  state.receiptError = true;
  state.receiptFetching = false;
  state.token = 0n;
  state.tokenError = false;
  state.tokenFetching = false;
  state.tokenRetry.mockImplementation(async () => ({ data: state.token }));
});
afterEach(cleanup);

it("recovers editing after a receipt error while retaining the original hash and warning", () => {
  render(<Composer />);
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "保留交易哈希并恢复编辑" }));
  const input = screen.getByRole("textbox") as HTMLTextAreaElement;
  expect(input.disabled).toBe(false);
  fireEvent.change(input, { target: { value: "Hello" } });
  expect((screen.getByRole("button", { name: "写入链上" }) as HTMLButtonElement).disabled).toBe(false);
  expect(screen.getByText(/这不会取消原交易/)).toBeTruthy();
  expect(screen.getByRole("link", { name: `查看尚未确认结果的交易：${state.hash}` }).getAttribute("href")).toContain(state.hash);
});

it("keeps active polling locked and offers receipt retry without resetting", () => {
  state.receiptError = false;
  state.receiptFetching = true;
  const view = render(<Composer />);
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).disabled).toBe(true);
  expect(screen.queryByRole("button", { name: "保留交易哈希并恢复编辑" })).toBeNull();
  state.receiptError = true;
  state.receiptFetching = false;
  view.rerender(<Composer />);
  fireEvent.click(screen.getByRole("button", { name: "重新查询确认状态" }));
  expect(state.receiptRetry).toHaveBeenCalledOnce();
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).disabled).toBe(true);
});

it("offers retry for settled zero without querying token 0, and recovers to an NFT", async () => {
  const view = render(<QuestNft sender={state.wallet} />);
  expect(screen.queryByText("正在确认纪念 NFT…")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "重新查询 NFT" }));
  await waitFor(() => expect(state.tokenRetry).toHaveBeenCalledOnce());
  expect(state.ownerRetry).not.toHaveBeenCalled();
  expect(state.metadataRetry).not.toHaveBeenCalled();
  state.token = 1n;
  view.rerender(<QuestNft sender={state.wallet} />);
  expect(screen.getByText("你的 Get Ready 纪念 NFT")).toBeTruthy();
});

it("distinguishes loading, fetching and failed NFT reads", () => {
  state.token = undefined;
  state.tokenFetching = true;
  const view = render(<QuestNft sender={state.wallet} />);
  expect(screen.getByText("正在确认纪念 NFT…")).toBeTruthy();
  state.tokenFetching = false;
  state.tokenError = true;
  view.rerender(<QuestNft sender={state.wallet} />);
  expect(screen.getByRole("button", { name: "重新查询 NFT" })).toBeTruthy();
});
