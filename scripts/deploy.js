const {ethers, upgrades} = require("hardhat");

async function main(){
    const [deployer, user] = await ethers.getSigners();

    const baseURI = process.env.BASE_URI;

    const GNFT = await ethers.getContractFactory("dNFT");

    const proxy = await upgrades.deployProxy(
        GNFT, [baseURI],
        {initializer : "initialize", kind: "uups"}
    );
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    const implementation = await  upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("Proxy address: ", proxyAddress);
    console.log("Implementation address: ", implementation);

}
main().catch(console.error)
