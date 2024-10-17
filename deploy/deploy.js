async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", balance.toString());

    const NFTProject = await ethers.getContractFactory("nftProject");
    const nftProject = await NFTProject.deploy("NFTCollection", 10000, ethers.utils.parseUnits("0.01", "gwei"));

    console.log("Contract deployed to:", nftProject.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
