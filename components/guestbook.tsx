"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ArrowUpRight, BookOpen, LoaderCircle, RefreshCw } from "lucide-react";
import { settings } from "@/lib/config";
import { shortAddress, transactionUrl } from "@/lib/contract";
import { loadLogPage } from "@/lib/logs";
import { friendlyError } from "@/lib/errors";

export function Guestbook() {
  const client = usePublicClient({ chainId: sepolia.id });
  const query = useInfiniteQuery({
    queryKey: [
      "guestbook",
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
      ),
    getNextPageParam: (page) => page.nextBlock,
    staleTime: 30000,
    retry: 1,
  });
  const seen = new Set<string>();
  const messages = (
    query.data?.pages.flatMap((page) => page.messages) ?? []
  ).filter((message) => {
    const key = `${message.transactionHash}:${message.logIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return (
    <section
      className="guestbook-section"
      id="guestbook"
      aria-labelledby="guestbook-title"
    >
      <div className="section-title">
        <div>
          <div className="section-kicker">
            A SMALL MESSAGE. A SHARED BEGINNING.
          </div>
          <h2 id="guestbook-title">
            链上留言板 <span className="tag">ONCHAIN</span>
          </h2>
          <p>相遇在北大，把好奇心留在链上。</p>
        </div>
        <button
          className="button outline small"
          disabled={!settings.ready || query.isFetching}
          onClick={() => query.refetch()}
        >
          <RefreshCw size={14} className={query.isFetching ? "spin" : ""} />{" "}
          刷新留言
        </button>
      </div>
      {!settings.ready ? (
        <div className="empty-state">
          <BookOpen size={28} strokeWidth={1.4} />
          <h3>新的学期，从第一条留言开始</h3>
          <p>合约配置完成后，真实的链上留言会出现在这里。</p>
          <span>每一条留言，都由 Ethereum Sepolia 公开记录</span>
        </div>
      ) : (
        <>
          {query.isPending && (
            <div className="empty-state" role="status">
              <LoaderCircle className="spin" />
              <p>正在读取链上的留言…</p>
            </div>
          )}
          {query.isError && (
            <div className="notice error" role="alert">
              <p>{friendlyError(query.error)}</p>
              <p>若问题持续，请组织者检查部署区块或缩小 RPC 日志查询批次。</p>
              <button
                className="text-button"
                onClick={() =>
                  query.isFetchNextPageError
                    ? query.fetchNextPage()
                    : query.refetch()
                }
              >
                重试读取
              </button>
            </div>
          )}
          {query.isSuccess && messages.length === 0 && (
            <div className="empty-state">
              <BookOpen size={28} />
              <h3>
                {query.hasNextPage
                  ? "已读取的区块中还没有留言"
                  : "还没有留言，你会是第一个吗？"}
              </h3>
              <p>
                {query.hasNextPage
                  ? "你可以继续读取更早的区块，或留下自己的第一条留言。"
                  : "发送一条问候，和未来的同行者打个招呼。"}
              </p>
            </div>
          )}
          {messages.length > 0 && (
            <div className="message-grid">
              {messages.map((message) => (
                <article
                  className="message-card"
                  key={`${message.transactionHash}:${message.logIndex}`}
                >
                  <div className="message-author">
                    <span
                      className="avatar"
                      style={{
                        backgroundColor: `#${message.sender.slice(2, 8)}`,
                      }}
                    />
                    <span title={message.sender}>
                      {shortAddress(message.sender)}
                    </span>
                    <span className="record-label">链上记录</span>
                  </div>
                  <p className="message-content">{message.content}</p>
                  <div className="message-meta">
                    <time
                      dateTime={new Date(
                        Number(message.timestamp) * 1000,
                      ).toISOString()}
                    >
                      {new Intl.DateTimeFormat("zh-CN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "Asia/Shanghai",
                      }).format(new Date(Number(message.timestamp) * 1000))}
                    </time>
                    <a
                      href={transactionUrl(message.transactionHash)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`查看 ${shortAddress(message.sender)} 的交易`}
                    >
                      查看交易 <ArrowUpRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
          {query.hasNextPage && (
            <div className="load-more">
              <button
                className="button outline small"
                disabled={query.isFetching}
                onClick={() => query.fetchNextPage()}
              >
                {query.isFetchingNextPage && (
                  <LoaderCircle className="spin" size={14} />
                )}
                读取更早的区块
              </button>
              <p>
                每次最多读取 {(settings.chunkSize * 3n).toLocaleString()}{" "}
                个区块，逐步追溯至合约部署。
              </p>
            </div>
          )}
        </>
      )}
      <div className="guestbook-footnote">
        <span>由智能合约事件驱动 · 无数据库 · 最新留言在前</span>
        <span>ETHEREUM SEPOLIA</span>
      </div>
    </section>
  );
}
