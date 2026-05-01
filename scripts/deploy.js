const { ethers, upgrades } = require("hardhat");

// Deploys the dNFT contract for the first time using a UUPS upgradeable proxy.
// The proxy address is permanent — it stays the same even when you upgrade the contract later.
// The implementation address changes with each upgrade.
//
// Run with:
//   BASE_URI=<your_ipfs_uri> npx hardhat run scripts/deploy.js --network sepolia
async function main() {
    const [deployer, user] = await ethers.getSigners();

    // BASE_URI points to the IPFS folder holding your metadata JSON files.
    // e.g. "https://gateway.pinata.cloud/ipfs/<CID>/"
    const baseURI = process.env.BASE_URI;

    // Get the contract factory for the initial implementation
    const GNFT = await ethers.getContractFactory("dNFT");

    // Deploy via a UUPS proxy — this calls initialize(baseURI) on the contract
    // instead of a regular constructor, because upgradeable contracts can't use constructors
    const proxy = await upgrades.deployProxy(
        GNFT, [baseURI],
        { initializer: "initialize", kind: "uups" }
    );
    await proxy.waitForDeployment();

    const proxyAddress = await proxy.getAddress();

    // The implementation is the actual contract logic behind the proxy
    const implementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("Proxy address: ", proxyAddress);         // save this — it never changes
    console.log("Implementation address: ", implementation);
}

main().catch(console.error);
