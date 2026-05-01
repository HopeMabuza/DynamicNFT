// Step labels shown at the top of the modal
const STEPS = ["Connect Wallet", "Check NFT", "Enter Galaxy"];

function StepBar({ currentStep }) {
  // currentStep: 0 = connecting, 1 = checking, 2 = done
  return (
    <div className="step-bar">
      {STEPS.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={label} className="step-item">
            <div className={`step-dot ${done ? "step-done" : active ? "step-active" : ""}`}>
              {done ? "✓" : i + 1}
            </div>
            <span className={`step-label ${active ? "step-label-active" : ""}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`step-line ${done ? "step-line-done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingModal({ walletStep, isExploring, onConnect, onClose, error }) {
  // Don't render if nothing needs showing
  if (walletStep === "idle" || walletStep === "done") {
    if (!isExploring) return null;
  }

  // Which progress step index are we on?
  const stepIndex =
    walletStep === "connecting" ? 0 :
    walletStep === "checking"   ? 1 :
    isExploring                 ? 2 : 2;

  return (
    <div className="modal-overlay">
      <div className="modal-card">

        {/* ── Wallet connection steps ── */}
        {(walletStep === "connecting" || walletStep === "checking" || walletStep === "no-nft") && (
          <>
            <StepBar currentStep={stepIndex} />

            {walletStep === "connecting" && (
              <div className="modal-body">
                <div className="modal-icon">🦊</div>
                <h2 className="modal-title">Connect Your Wallet</h2>
                <p className="modal-text">
                  We use MetaMask to verify who you are. Click the button below —
                  MetaMask will ask you to approve the connection.
                </p>
                <button className="btn-primary" onClick={onConnect}>
                  Connect MetaMask
                </button>
                {error && <p className="error-msg" style={{ marginTop: "1rem" }}>{error}</p>}
              </div>
            )}

            {walletStep === "checking" && (
              <div className="modal-body">
                <div className="spinner modal-spinner" />
                <h2 className="modal-title">Checking Ownership</h2>
                <p className="modal-text">
                  Scanning the blockchain to see if your wallet holds a Galaxy Club NFT…
                </p>
              </div>
            )}

            {walletStep === "no-nft" && (
              <div className="modal-body">
                <div className="modal-icon">🌌</div>
                <h2 className="modal-title">No Galaxy NFT Found</h2>
                <p className="modal-text">
                  Your wallet doesn't hold a Galaxy Club NFT yet. You'll need to mint
                  one to start your cosmic journey.
                </p>
                <button className="btn-primary" onClick={onClose}>
                  Got it
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Explore Galaxy signing step ── */}
        {isExploring && (
          <div className="modal-body">
            <div className="spinner modal-spinner" />
            <h2 className="modal-title">Confirm in MetaMask</h2>
            <p className="modal-text">
              MetaMask is waiting for you to approve the <strong>Explore Galaxy</strong> transaction.
              This records your exploration on the blockchain and costs a small gas fee.
            </p>
            <p className="modal-hint">
              👆 Check the MetaMask popup — it may be behind this window.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
