require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const contractAddress = process.env.PROXY_ADDRESS;
const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)"
];

const nftContractRead = new ethers.Contract(contractAddress, abi, provider);

const SIGN_MESSAGE = "Welcome to Galaxy Club! Sign to verify you own the wallet.";
const EXPLORE_THRESHOLD = 5;

// In-memory click tracker: { walletAddress: { tokenId: count } }
// Resets when server restarts — fine for testing
const clickTracker = {};

function verifySignature(walletAddress, signature) {
    const recovered = ethers.verifyMessage(SIGN_MESSAGE, signature);
    return recovered.toLowerCase() === walletAddress.toLowerCase();
}

// Verify NFT ownership and grant access
app.post('/verify-nft', async (req, res) => {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
        return res.status(400).json({ error: "walletAddress and signature are required" });
    }

    try {
        if (!verifySignature(walletAddress, signature)) {
            return res.status(401).json({ authorized: false, message: "Signature does not match wallet" });
        }

        const balance = await nftContractRead.balanceOf(walletAddress);

        if (balance > 0n) {
            res.json({ authorized: true, message: "Access Granted" });
        } else {
            res.status(403).json({ authorized: false, message: "No NFT found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error verifying ownership" });
    }
});

// Tracks explore button clicks server-side.
// On click 3 the server tells the frontend to call userSetNewURI and resets the counter.
app.post('/explore-click', async (req, res) => {
    const { walletAddress, tokenId, signature } = req.body;

    if (!walletAddress || tokenId === undefined || !signature) {
        return res.status(400).json({ error: "walletAddress, tokenId and signature are required" });
    }

    try {
        if (!verifySignature(walletAddress, signature)) {
            return res.status(401).json({ error: "Signature does not match wallet" });
        }

        const actualOwner = await nftContractRead.ownerOf(tokenId);
        if (actualOwner.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ error: "You do not own this token" });
        }

        const key = walletAddress.toLowerCase();
        if (!clickTracker[key]) clickTracker[key] = {};
        if (clickTracker[key][tokenId] === undefined) clickTracker[key][tokenId] = 0;

        clickTracker[key][tokenId] += 1;
        const count = clickTracker[key][tokenId];

        if (count >= EXPLORE_THRESHOLD) {
            clickTracker[key][tokenId] = 0;
            return res.json({ upgradeNow: true, clickCount: count });
        }

        res.json({ upgradeNow: false, clickCount: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error tracking click" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
