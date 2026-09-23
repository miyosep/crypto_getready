import { Hexagon } from "lucide-react";
import { Composer } from "@/components/composer";
import { QuestGuide } from "@/components/education";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        跳转到主要内容
      </a>
      <SiteHeader />
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
            <p>PKUBA 2026 秋季入门任务：在 Sepolia 测试网上完成一笔转账，再提交一条留言。</p>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <Hexagon size={28} strokeWidth={1.1} />
            <span>
              YOUR FIRST
              <br />
              ONCHAIN HELLO
            </span>
            <span className="stamp-year">2026</span>
          </div>
        </section>
        <div className="workspace">
          <QuestGuide />
          <Composer />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
