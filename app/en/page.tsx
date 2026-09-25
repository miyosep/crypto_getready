import { Hexagon } from "lucide-react";
import { Composer } from "@/components/composer";
import { QuestGuide } from "@/components/education";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function EnglishHome() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader locale="en" />
      <main id="main" className="container">
        <section className="hero">
          <div>
            <p className="hero-eyebrow">
              <span className="hero-department">PKUBA Tech</span>
              <span className="hero-edition">Fall 2026 / Get Ready Quest</span>
            </p>
            <h1>
              Start here,
              <br />
              Build on Ethereum<span className="hero-period" />
            </h1>
            <p>
              PKUBA Fall 2026 beginner quest. No prior experience required:
              learn what a wallet is, get test ETH, make your first Sepolia
              transfer, and leave an onchain message.
            </p>
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
          <QuestGuide locale="en" />
          <Composer locale="en" />
        </div>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
