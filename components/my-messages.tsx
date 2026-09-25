"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ExternalLink, LoaderCircle, MessageSquareText, RefreshCw } from "lucide-react";
import { type Address } from "viem";
import { usePublicClient } from "wagmi";
import { sepolia } from "wagmi/chains";
import { settings } from "@/lib/config";
import { transactionUrl } from "@/lib/contract";
import { friendlyError } from "@/lib/errors";
import type { Locale } from "@/lib/i18n";
import { loadLogPage } from "@/lib/logs";

export function MyMessages({
  address,
  locale = "zh",
}: {
  address: Address;
  locale?: Locale;
}) {
  const en = locale === "en";
  const client = usePublicClient({ chainId: sepolia.id });
  const query = useInfiniteQuery({
    queryKey: [
      "guestbook",
      "mine",
      address.toLowerCase(),
      settings.address,
      settings.deploymentBlock?.toString(),
      settings.rpcUrl,
    ],
    enabled: settings.ready && !!client,
    initialPageParam: undefined as bigint | undefined,
    queryFn: ({ pageParam }) =>
      loadLogPage(
        client!,
        settings.address!,
        settings.deploymentBlock!,
        settings.chunkSize,
        pageParam,
        address,
      ),
    getNextPageParam: (page) => page.nextBlock,
    staleTime: 30_000,
    retry: 1,
  });
  const {
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isSuccess,
  } = query;

  // A message may be older than the first safe RPC window. Continue through
  // the contract's bounded history so this section represents the wallet's
  // complete onchain record, not only its recent activity.
  useEffect(() => {
    if (
      isSuccess &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchNextPageError
    ) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isSuccess,
  ]);

  const seen = new Set<string>();
  const messages = (query.data?.pages.flatMap((page) => page.messages) ?? []).filter(
    (message) => {
      const key = `${message.transactionHash}:${message.logIndex}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    },
  );
  const scanning = query.isPending || query.isFetchingNextPage;
  const scanError = query.isError || query.isFetchNextPageError;

  return (
    <section className="my-messages" aria-labelledby="my-messages-title">
      <div className="my-messages-heading">
        <div>
          <span className="my-messages-icon" aria-hidden="true">
            <MessageSquareText size={17} />
          </span>
          <h3 id="my-messages-title">
            {en ? "My onchain messages" : "我的链上留言"}
          </h3>
        </div>
        {!scanning && (
          <button
            type="button"
            className="text-button"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw size={13} className={query.isFetching ? "spin" : ""} />
            {en ? "Refresh" : "刷新"}
          </button>
        )}
      </div>

      {messages.length > 0 && (
        <div className="my-message-list">
          {messages.map((message) => {
            const date = new Date(Number(message.timestamp) * 1000);
            return (
              <article
                className="my-message-item"
                key={`${message.transactionHash}:${message.logIndex}`}
              >
                <p>{message.content}</p>
                <div className="my-message-meta">
                  <time dateTime={date.toISOString()}>
                    {new Intl.DateTimeFormat(en ? "en-US" : "zh-CN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Shanghai",
                    }).format(date)}
                  </time>
                  <a
                    className="button outline small"
                    href={transactionUrl(message.transactionHash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {en ? "View on Etherscan" : "在 Etherscan 上查看"}
                    <ExternalLink size={13} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {scanning && (
        <p className="my-messages-status" role="status">
          <LoaderCircle className="spin" size={15} />
          {en
            ? "Searching this wallet's onchain messages…"
            : "正在查找这个钱包写下的链上留言…"}
        </p>
      )}

      {!scanning && !scanError && messages.length === 0 && (
        <p className="my-messages-status">
          {en
            ? "This wallet has not left a message yet. After you complete the step below, it will appear here."
            : "这个钱包还没有写下留言。完成下面的步骤后，它会出现在这里。"}
        </p>
      )}

      {scanError && (
        <div className="notice error" role="alert">
          <p>{friendlyError(query.error, locale)}</p>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              query.isFetchNextPageError
                ? query.fetchNextPage()
                : query.refetch()
            }
          >
            {en ? "Try again" : "重新读取"}
          </button>
        </div>
      )}
    </section>
  );
}
