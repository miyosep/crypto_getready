import Image from "next/image";
import { Composer } from "@/components/composer";
import { QuestGuide } from "@/components/education";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        跳转到主要内容
      </a>
      <SiteHeader locale="zh" />
      <main id="main" className="container">
        <section className="hero">
          <div>
            <p className="hero-eyebrow" lang="en">
              <span className="hero-department">PKUBA Tech</span>
              <span className="hero-edition">Fall 2026 / Get Ready Quest</span>
            </p>
            <h1 lang="en">
              Start here,
              <br />
              Build on Ethereum<span className="hero-period"></span>
            </h1>
            <p>PKUBA 2026 秋季招新入门任务，零基础也可以完成：认识钱包、领取测试币，在 Sepolia 上完成第一笔转账和链上留言。</p>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <Image src="/ethereum-logo.svg" alt="" width={28} height={40} style={{ objectFit: "contain", flexShrink: 0 }} unoptimized />
            <span>
              YOUR FIRST
              <br />
              ONCHAIN HELLO
            </span>
            <span className="stamp-year">2026</span>
          </div>
        </section>
        <div className="workspace">
          <QuestGuide locale="zh" />
          <Composer locale="zh" />
        </div>
      </main>
      <SiteFooter locale="zh" />
    </>
  );
}
