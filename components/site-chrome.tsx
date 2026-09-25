import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function SiteHeader({
  guide = false,
  locale = "zh",
}: {
  guide?: boolean;
  locale?: Locale;
}) {
  const en = locale === "en";
  const homeHref = en ? "/en" : "/";
  const guideHref = en ? "/en/guide" : "/guide";
  const languageHref = en
    ? guide
      ? "/guide"
      : "/"
    : guide
      ? "/en/guide"
      : "/en";
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          className="brand"
          href={homeHref}
          aria-label={en ? "PKUBA Get Ready home" : "PKUBA Get Ready 首页"}
        >
          <span className="brand-logo">
            <Image
              src="/pkuba-symbol.svg"
              alt="PKU Blockchain"
              width={48}
              height={48}
              preload
              className="brand-logo-image"
            />
          </span>
          <span>
            PKUBA <span className="brand-divider">/</span>{" "}
            <span className="brand-name" lang="en">
              Get Ready
            </span>
          </span>
        </Link>
        <nav aria-label={en ? "Main navigation" : "主导航"}>
          {!guide && (
            <Link href={guideHref} target="_blank" rel="noreferrer">
              {en ? "Beginner guide" : "入门指南"} ↗
            </Link>
          )}
          <a className="language-switch" href={languageHref}>
            {en ? "中文" : "EN"}
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ locale = "zh" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <footer className="site-footer">
      <div>
        <span>
          <strong>PKUBA</strong>{" "}
          {en
            ? "Peking University Blockchain Association · Tech Department"
            : "北京大学区块链协会 · 技术部"}
        </span>
        <span>
          <span className="footer-motto" lang="en">
            Less Trust, More Truth
          </span>{" "}
          <span className="footer-year">© 2026</span>
        </span>
      </div>
    </footer>
  );
}
