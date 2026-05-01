require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// Owner wallet — used to call updatePoints (onlyOwner function)
const ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = process.env.PROXY_ADDRESS;
const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokensSiteVisits(uint256 tokenId) view returns (uint256)",
    "function recordVisit(uint256 tokenId) external"
];

const nftContractRead  = new ethers.Contract(contractAddress, abi, provider);      // for reading
const nftContractWrite = new ethers.Contract(contractAddress, abi, ownerWallet);   // for writing

const SIGN_MESSAGE = "Welcome to Galaxy Club! Sign to verify you own the wallet.";

// Helper: verify the wallet signature
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

// Called every time the user visits the site
app.post('/track-visit', async (req, res) => {
    const { walletAddress, tokenId, signature } = req.body;

    if (!walletAddress || tokenId === undefined || !signature) {
        return res.status(400).json({ error: "walletAddress, tokenId and signature are required" });
    }

    try {
        // 1. Verify the user controls the wallet
        if (!verifySignature(walletAddress, signature)) {
            return res.status(401).json({ error: "Signature does not match wallet" });
        }

        // 2. Confirm this wallet actually owns that tokenId
        const actualOwner = await nftContractRead.ownerOf(tokenId);
        if (actualOwner.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ error: "You do not own this token" });
        }

        // 3. Record +1 visit on-chain using the owner's wallet
        const tx = await nftContractWrite.recordVisit(tokenId);
        await tx.wait();

        // 4. Return the updated visit count
        const visits = await nftContractRead.tokensSiteVisits(tokenId);
        res.json({ success: true, visits: visits.toString() });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error recording visit" });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
