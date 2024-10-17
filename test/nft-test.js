// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("nftProject", function () {
    let NftProject, nftProject, owner, addr1, addr2;
    const collectionName = "Luca Collection";
    const maxSupply = 4;
    const mintCost = ethers.utils.parseGwei("1");

    beforeEach(async function () {
        NftProject = await ethers.getContractFactory("nftProject");
        [owner, addr1, addr2] = await ethers.getSigners();
        nftProject = await NftProject.deploy(collectionName, maxSupply, mintCost);
        await nftProject.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await nftProject.owner()).to.equal(owner.address);
        });

        it("Should set the collection name", async function () {
            expect(await nftProject.collectionName()).to.equal(collectionName);
        });

        it("Should set the maximum supply", async function () {
            expect(await nftProject.maxSupply()).to.equal(maxSupply);
        });
    });

    describe("Create NFTs", function () {
        it("Should create an NFT correctly", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Luca Collection", "Luca", "This's my collection");


            expect(metadata[0]).to.equal("Luca Collection");
            expect(metadata[1]).to.equal("Luca");
            expect(metadata[2]).to.equal("This's my collection");
            expect(metadata[3]).to.equal(collectionName);
            expect(metadata[4]).to.equal(addr1.address);
        });

        it("Should not allow to create more nft than max supply settled", async function () {
            for (let i = 0; i < maxSupply; i++) {
                await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
                await nftProject.connect(addr1).createNFT(`Magazine ${i}`, `Author ${i}`, `Description ${i}`);
            }

            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await expect(nftProject.connect(addr1).createNFT("Magazine", "Author", "Description"))
                .to.be.revertedWith("Max supply reached");
        });

        it("Should not allow create without enough gwei", async function () {
            await expect(nftProject.connect(addr1).createNFT("Luca Collection", "Luca", "This's my collection"))
                .to.be.revertedWith("Not enough gwei");
        });
    });

    describe("Transferring NFTs", function () {
        it("Should transfer an NFT", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Luca Collection", "Luca", "This's my collection");

            const nftId = 1;
            await nftProject.connect(addr1).exchangeNFT(addr2.address, nftId);

            expect(await nftProject.ownerOf(nftId)).to.equal(addr2.address);
        });

        it("Should allow to transfer nft only to their owner", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Luca Collection", "Luca", "This's my collection");

            const nftId = 1;
            await expect(nftProject.connect(addr2).exchangeNFT(addr1.address, nftId))
                .to.be.revertedWith("You are not the owner of this NFT");
        });

        it("Should not allow transferring to invalid address", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Luca Collection", "Luca", "This's my collection");

            const nftId = 1;
            await expect(nftProject.connect(addr1).exchangeNFT(ethers.constants.AddressZero, nftId))
                .to.be.revertedWith("Invalid address");
        });
    });

    describe("Withdrawals", function () {
        it("Should not allow to withdraw except for the owener", async function () {
            await expect(nftProject.connect(addr1).withdraw())
                .to.be.revertedWith("Your not the owner");
        });

        it("Should not allow withdrawing with no funds", async function () {
            await expect(nftProject.withdraw())
                .to.be.revertedWith("No funds available to withdraw");
        });
    });
});
