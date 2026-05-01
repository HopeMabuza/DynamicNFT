const {ethers, upgrades} = require("hardhat");

async function main(){
    const [deployer] = await ethers.getSigners();

    const proxyAddress = process.env.PROXY_ADDRESS;

    const GNFT2 = await ethers.getContractFactory("dNFT2");

    const proxy = await upgrades.upgradeProxy(
        proxyAddress, GNFT2,[],
        {initializer : "", kind: "uups"}
    );
    await proxy.waitForDeployment();

    const implementation = await  upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("Proxy address: ", proxyAddress);
    console.log("Implementation address: ", implementation);

}
main().catch(console.error)
