const {ethers, upgrades} = require("hardhat");

async function main(){
    const [deployer] = await ethers.getSigners();

    const proxyAddress = process.env.PROXY_ADDRESS;

    const GNFT3 = await ethers.getContractFactory("dNFT3");

    const proxy = await upgrades.upgradeProxy(
        proxyAddress, GNFT3,
        { kind: "uups" }
    );
    await proxy.waitForDeployment();

    const implementation = await  upgrades.erc1967.getImplementationAddress(proxyAddress);

    console.log("Proxy address: ", proxyAddress);
    console.log("Implementation address: ", implementation);

    console.log("Setting new siteVisit threshold.....");
    await proxy.setSiteVisits(3);


}
main().catch(console.error)
