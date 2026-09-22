import Image from "next/image";
import Link from "next/link";

export function SiteHeader({ guide = false }: { guide?: boolean }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="PKUBA Get Ready 首页">
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
        {!guide && (
          <nav aria-label="主导航">
            <Link href="/guide" target="_blank" rel="noreferrer">
              入门指南 ↗
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span>
          <strong>PKUBA</strong> 北京大学区块链协会 · 技术部
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
