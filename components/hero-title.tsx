export function HeroTitle() {
  return (
    <h1 className="hero-title" lang="en">
      <span className="hero-title-line">
        <span className="hero-emoji hero-wave" aria-hidden="true">
          👋
        </span>
        <span>Start here,</span>
      </span>
      <span className="hero-title-line hero-build-line">
        <span>Build on</span>{" "}
        <span className="hero-ethereum">Ethereum</span>
        <span className="hero-emoji hero-rocket" aria-hidden="true">
          🚀
        </span>
      </span>
    </h1>
  );
}
