import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MyContractABI from "../abi/myContract.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function useContract() {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const [tokenId, setTokenId] = useState(null);
  const [nftStatus, setNftStatus] = useState("idle"); // idle | loading | has-nft | no-nft
  const [visitCount, setVisitCount] = useState(0);
  const [galaxyName, setGalaxyName] = useState(null);
  const [isExploring, setIsExploring] = useState(false);
  const [threshold, setThreshold] = useState(10); // mirrors siteVisits on the contract

  // Tracks the manual connect flow so the modal knows what step to show
  // 'idle' | 'connecting' | 'checking' | 'no-nft' | 'done'
  const [walletStep, setWalletStep] = useState("idle");

  async function findTokenId(contractInst, userAddress) {
    const balance = await contractInst.balanceOf(userAddress);
    if (balance === 0n) return null;

    const nextId = await contractInst.nextTokenId();
    for (let i = 0n; i < nextId; i++) {
      try {
        const owner = await contractInst.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) return i;
      } catch {
        // token doesn't exist — skip
      }
    }
    return null;
  }

  // Parses the galaxy name from a tokenURI (data URI or HTTP/IPFS URL)
  async function fetchGalaxyName(uri) {
    try {
      let metadata = null;
      if (uri.startsWith("data:application/json;base64,")) {
        metadata = JSON.parse(atob(uri.split(",")[1]));
      } else if (uri.startsWith("data:application/json,")) {
        metadata = JSON.parse(decodeURIComponent(uri.slice("data:application/json,".length)));
      } else {
        const httpUrl = uri.startsWith("ipfs://")
          ? `https://ipfs.io/ipfs/${uri.slice(7)}`
          : uri;
        const res = await fetch(httpUrl);
        metadata = await res.json();
      }
      return metadata?.name ?? null;
    } catch {
      return null;
    }
  }

  async function refreshVisitCount(contractInst, tid, currentThreshold) {
    const visits = await contractInst.tokensSiteVisits(tid);
    const count = Number(visits);
    setVisitCount(count);

    if (count >= currentThreshold) {
      try {
        const uri = await contractInst.tokenURI(tid);
        setGalaxyName((await fetchGalaxyName(uri)) ?? "Unknown Galaxy");
      } catch {
        setGalaxyName("Unknown Galaxy");
      }
    }
  }

  // Returns 'has-nft' or 'no-nft' so callers can update walletStep
  async function loadNFTData(contractInst, userAddress) {
    setNftStatus("loading");
    setError(null);

    try {
      const found = await findTokenId(contractInst, userAddress);

      if (found === null) {
        setNftStatus("no-nft");
        return "no-nft";
      }

      setTokenId(found);
      const contractThreshold = await contractInst.siteVisits();
      const thresh = Number(contractThreshold);
      setThreshold(thresh);
      await refreshVisitCount(contractInst, found, thresh);
      setNftStatus("has-nft");
      return "has-nft";
    } catch (err) {
      setError(err.message);
      setNftStatus("idle");
      return "error";
    }
  }

  async function setupWallet(userAddress, web3Provider, web3Signer) {
    const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, MyContractABI, web3Provider);
    setSigner(web3Signer);
    setContract(web3Contract);
    setAccount(userAddress);
    setIsConnected(true);
    return await loadNFTData(web3Contract, userAddress);
  }

  // Silent auto-reconnect on page refresh — no modal, no popup
  useEffect(() => {
    if (!window.ethereum) return;

    async function autoConnect() {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const web3Signer = await web3Provider.getSigner();
          await setupWallet(accounts[0], web3Provider, web3Signer);
        }
      } catch (err) {
        console.warn("Auto-connect failed:", err.message);
      }
    }

    autoConnect();
  }, []);

  // Handle account switches in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;
    const handler = async (accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccount(null);
        setSigner(null);
        setContract(null);
        setNftStatus("idle");
        setTokenId(null);
        setVisitCount(0);
        setGalaxyName(null);
        setWalletStep("idle");
      } else {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        await setupWallet(accounts[0], web3Provider, web3Signer);
      }
    };
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum.removeListener("accountsChanged", handler);
  }, []);

  // Manual connect — drives the step-by-step modal
  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("MetaMask is not installed. Please install it.");
      setError(null);
      setWalletStep("connecting");

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      setWalletStep("checking");
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const result = await setupWallet(accounts[0], web3Provider, web3Signer);

      setWalletStep(result === "no-nft" ? "no-nft" : "done");
    } catch (err) {
      setError(err.message);
      setWalletStep("idle");
    }
  }

  // Called when user clicks "Explore Galaxy" button
  async function exploreGalaxy() {
    if (!contract || !signer || tokenId === null) return;
    setIsExploring(true);
    setError(null);

    try {
      const tx = await contract.connect(signer).exploreGalaxy(tokenId);
      await tx.wait();
      await refreshVisitCount(contract, tokenId, threshold);
    } catch (err) {
      if (err.code === "ACTION_REJECTED") {
        setError("Transaction cancelled.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsExploring(false);
    }
  }

  return {
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
  };
}
