const CIRCUMFERENCE = 2 * Math.PI * 70;

function VisitRing({ count, max }) {
  const progress = Math.min(count / max, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="visit-ring-wrap">
      <svg className="visit-ring" viewBox="0 0 180 180" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r="70" className="ring-track" />
        <circle
          cx="90"
          cy="90"
          r="70"
          className="ring-fill"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div className="ring-center">
        <span className="visit-num">{count}</span>
        <span className="visit-lbl">VISITS</span>
      </div>
    </div>
  );
}

function LoadingCard({ message, sub }) {
  return (
    <div className="card">
      <div className="spinner" />
      <p className="card-text">{message}</p>
      {sub && <p className="card-sub">{sub}</p>}
    </div>
  );
}

export default function GalaxyDashboard({
  nftStatus,
  visitCount,
  galaxyName,
  tokenId,
  isExploring,
  exploreGalaxy,
  error,
  threshold,
}) {
  if (nftStatus === "loading") {
    return (
      <div className="dashboard">
        <LoadingCard message="Scanning the cosmos for your NFT…" />
      </div>
    );
  }

  if (nftStatus === "no-nft") {
    return (
      <div className="dashboard">
        <div className="card">
          <div className="no-nft-icon">🌌</div>
          <h2 className="card-title">No Galaxy NFT Found</h2>
          <p className="card-text">
            You don't own a Galaxy Club NFT yet. Mint one to begin your cosmic journey.
          </p>
        </div>
      </div>
    );
  }

  if (nftStatus === "has-nft" && visitCount >= threshold) {
    return (
      <div className="dashboard">
        <div className="card congrats-card">
          <div className="congrats-burst" aria-hidden="true" />
          <p className="congrats-eyebrow">CONGRATULATIONS</p>
          <p className="congrats-sub">You own</p>
          <h2 className="galaxy-name">{galaxyName ?? "Your Galaxy"}</h2>
          <div className="congrats-visits">
            <span className="visit-num">{visitCount}</span>
            <span className="visit-lbl">COSMIC EXPLORATIONS</span>
          </div>
        </div>
      </div>
    );
  }

  if (nftStatus === "has-nft") {
    const remaining = threshold - visitCount;
    return (
      <div className="dashboard">
        <div className="card tracker-card">
          <p className="token-label">
            Token #{tokenId !== null ? tokenId.toString() : "—"}
          </p>

          <VisitRing count={visitCount} max={threshold} />

          <p className="tracker-msg">
            {remaining === 1
              ? "1 more exploration to reveal your galaxy"
              : `${remaining} more explorations to reveal your galaxy`}
          </p>

          <div className="visit-dots" aria-label={`${visitCount} of ${threshold} explorations`}>
            {Array.from({ length: threshold }, (_, i) => (
              <span key={i} className={`dot${i < visitCount ? " dot-on" : ""}`} />
            ))}
          </div>

          <button
            className="btn-explore"
            onClick={exploreGalaxy}
            disabled={isExploring}
          >
            ✦ Explore Galaxy
          </button>

          {error && <p className="error-msg" style={{ marginTop: "1rem" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <LoadingCard message="Initialising…" />
    </div>
  );
}
