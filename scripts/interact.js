const {ethers, upgrades} = require("hardhat");

async function main(){
    const [deployer, user1, user2] = await ethers.getSigners();

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

    console.log("User mints.....");
    await proxy.connect(user1).mint({ value: ethers.parseEther("0.0001") });

    let initialTokenURI = await proxy.tokenURI(0);
    console.log("Initial token URI: ", initialTokenURI);

    console.log("User visits site 11 times");
    await proxy.connect(deployer).updatePoints(0, 11);

    let newTokenURI = await proxy.tokenURI(0);
    console.log("User's new token URI: ", newTokenURI);

    console.log("User2 mints.....");
    await proxy.connect(user2).mint({ value: ethers.parseEther("0.0001") });

    initialTokenURI = await proxy.tokenURI(1);
    console.log("Initial token URI: ", initialTokenURI);

    console.log("User2 visits site 11 times");
    await proxy.connect(deployer).updatePoints(1, 11);

    newTokenURI = await proxy.tokenURI(1);
    console.log("User's new token URI: ", newTokenURI);

}
main().catch(console.error)
