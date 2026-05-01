import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MyContractABI from "../abi/myContract.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function useContract() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // On mount: create a read-only contract so data loads without wallet
  useEffect(() => {
    const readOnlyProvider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_RPC_URL
    );
    const readOnlyContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MyContractABI,
      readOnlyProvider
    );
    setProvider(readOnlyProvider);
    setContract(readOnlyContract);
  }, []);

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      });
    }
  }, []);

  // Connect wallet — upgrades contract from read-only to read+write
  async function connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it.");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      // Recreate contract with signer so user can write to it
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyContractABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Wallet connection error:", err);
    }
  }

  return { provider, signer, contract, account, isConnected, error, connectWallet };
}