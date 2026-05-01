import { useContract } from "./hooks/useContract";
import WalletConnect from "./components/WalletConnect";
import ContractReader from "./components/ContractReader";
import ContractWriter from "./components/ContractWriter";

function App() {
  // Call the hook ONCE here, then pass values down as props.
  // This means there is one single source of truth for wallet state.
  const { contract, account, isConnected, error, connectWallet } = useContract();

  return (
    <div>
      <h1>My DApp</h1>

      <WalletConnect
        account={account}
        isConnected={isConnected}
        error={error}
        connectWallet={connectWallet}
      />

      <hr />

      <ContractReader contract={contract} />

      <hr />

      <ContractWriter contract={contract} isConnected={isConnected} />
    </div>
  );
}

export default App;