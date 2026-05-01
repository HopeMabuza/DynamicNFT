# Dynamic NFT — Galaxy Club

A learning project built to explore three core concepts in Web3 development:

- **Dynamic NFTs** — NFTs whose metadata and image change based on on-chain activity
- **IPFS** — storing NFT images and metadata on a decentralised file system
- **Frontend integration** — connecting a React app to a smart contract using ethers.js and MetaMask

---

## What it does

Users connect their MetaMask wallet to the Galaxy Club site. If they hold a Galaxy Club NFT, they can click **Explore Galaxy** to record an exploration on-chain. After a set number of explorations the NFT's metadata upgrades on-chain — revealing the name of their galaxy on the congratulations screen.

**User flow:**

1. Connect wallet via MetaMask popup
2. App checks if the wallet holds a Galaxy Club NFT
3. If yes, the tracker shows the current exploration count and a progress ring
4. Each click of **Explore Galaxy** sends a transaction that increments the on-chain counter
5. Once the threshold is reached, the congratulations screen reveals the galaxy name

---

## What I learned

### Dynamic NFTs
The contract (`dNFT3`) stores an exploration count per token in a mapping. The `tokenURI` function returns a different metadata file depending on whether the count has reached the threshold — this is what makes the NFT "dynamic". The image and name change on-chain once the threshold is crossed, and can be seen by refreshing the NFT metadata in MetaMask (Remove NFT → Import NFT).

### IPFS
NFT images and metadata JSON files are stored on IPFS via Pinata. The contract's `baseURI` points to the IPFS gateway. The metadata URI format is `baseURI + tokenId + ".json"` after the threshold, and `baseURI + "0.json"` before it.

### Frontend
The React frontend uses **ethers.js v6** to talk to the contract directly — no backend server needed. Key things handled:
- Auto-reconnecting the wallet on page refresh using `eth_accounts` (no popup)
- Finding which token ID a wallet owns by scanning `ownerOf`
- Reading the `siteVisits` threshold live from the contract so the UI always stays in sync with whatever value is set on-chain
- A step-by-step modal that guides the user through connecting, NFT verification, and transaction signing

### Upgradeable contracts
The contract uses the UUPS (Universal Upgradeable Proxy Standard) pattern from OpenZeppelin. This allowed adding new functions like `exploreGalaxy` and `setSiteVisits` after the initial deployment without changing the contract address or losing any data.

---

## Tech stack

| Layer | Tool |
|---|---|
| Smart contract | Solidity, OpenZeppelin (ERC721, UUPS upgradeable) |
| Network | Sepolia testnet |
| Metadata storage | IPFS via Pinata |
| Frontend | React + Vite |
| Blockchain library | ethers.js v6 |
| Wallet | MetaMask |
| Contract development | Hardhat |

---

## Project structure

```
DynamicNFT/
├── contracts/
│   └── dNFT.sol              # Main contract (dNFT3) — ERC721, UUPS upgradeable
├── scripts/
│   ├── deploy.js             # Initial proxy deployment
│   ├── upgrade.js            # Upgrades implementation and sets new threshold
│   ├── changeSiteVisits.js
│   └── interact.js
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useContract.js      # All blockchain logic
│   │   ├── components/
│   │   │   ├── GalaxyDashboard.jsx # NFT tracker, explore button, congrats screen
│   │   │   └── OnboardingModal.jsx # Step-by-step wallet connect modal
│   │   ├── abi/
│   │   │   └── myContract.json     # Contract ABI
│   │   └── App.jsx
│   └── .env                  # VITE_CONTRACT_ADDRESS, VITE_RPC_URL
└── README.md
```

---

## Running locally

```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Start the frontend dev server
npm run dev
```

Set up `frontend/.env`:

```
VITE_CONTRACT_ADDRESS=<your proxy address>
VITE_RPC_URL=<your Sepolia RPC URL>
```

Make sure MetaMask is installed and connected to **Sepolia testnet**.
