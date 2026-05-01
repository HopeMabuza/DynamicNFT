import { useMemo } from "react";
import { useContract } from "./hooks/useContract";
import GalaxyDashboard from "./components/GalaxyDashboard";
import OnboardingModal from "./components/OnboardingModal";
import "./App.css";

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
        dur: Math.random() * 3 + 2,
      })),
    []
  );

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function LandingView({ onOpenModal }) {
  return (
    <div className="landing">
      <div className="galaxy-orb" aria-hidden="true">
        <div className="orb-ring" />
        <div className="orb-ring orb-ring-2" />
      </div>
      <h2 className="landing-headline">JOIN THE ADVENTURE</h2>
      <p className="landing-sub">
        Connect your wallet to enter Galaxy Club, track your cosmic explorations,
        and unlock your very own galaxy.
      </p>
      <button className="btn-primary" onClick={onOpenModal}>
        Connect Wallet
      </button>
    </div>
  );
}

function App() {
  const {
    account,
    isConnected,
    error,
    connectWallet,
    tokenId,
    nftStatus,
    visitCount,
    galaxyName,
    isExploring,
    exploreGalaxy,
    walletStep,
    setWalletStep,
    threshold,
  } = useContract();

  const shortAddress = account
    ? `${account.slice(0, 6)}…${account.slice(-4)}`
    : null;

  // Opens the modal and kicks off the connect flow
  function handleOpenModal() {
    setWalletStep("connecting");
  }

  // The modal calls this when the user clicks "Connect MetaMask"
  async function handleConnect() {
    await connectWallet();
  }

  // Close modal (used for "Got it" on the no-nft screen)
  function handleCloseModal() {
    setWalletStep("idle");
  }

  const showModal =
    walletStep === "connecting" ||
    walletStep === "checking" ||
    walletStep === "no-nft" ||
    isExploring;

  return (
    <div className="app">
      <StarField />

      <header className="header">
        <div className="logo-lockup">
          <span className="logo-star">✦</span>
          <span className="logo-text">GALAXY CLUB</span>
          <span className="logo-star">✦</span>
        </div>
        <p className="tagline">EXPLORING THE COSMOS</p>
        {isConnected && <div className="wallet-badge">{shortAddress}</div>}
      </header>

      <main className="main">
        {!isConnected ? (
          <LandingView onOpenModal={handleOpenModal} />
        ) : (
          <GalaxyDashboard
            nftStatus={nftStatus}
            visitCount={visitCount}
            galaxyName={galaxyName}
            tokenId={tokenId}
            isExploring={isExploring}
            exploreGalaxy={exploreGalaxy}
            error={error}
            threshold={threshold}
          />
        )}
      </main>

      <footer className="footer">
        <p>Galaxy Club · Powered by the Blockchain</p>
      </footer>

      {showModal && (
        <OnboardingModal
          walletStep={walletStep}
          isExploring={isExploring}
          onConnect={handleConnect}
          onClose={handleCloseModal}
          error={error}
        />
      )}
    </div>
  );
}

export default App;
