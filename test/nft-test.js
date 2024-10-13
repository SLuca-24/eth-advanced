// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("nftProject", function () {
    let NftProject, nftProject, owner, addr1, addr2;
    const collectionName = "Test Collection";
    const maxSupply = 10;
    const mintCost = ethers.utils.parseEther("0.01"); // 0.01 ether

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

        it("Should set the collection name correctly", async function () {
            expect(await nftProject.collectionName()).to.equal(collectionName);
        });

        it("Should set the maximum supply correctly", async function () {
            expect(await nftProject.maxSupply()).to.equal(maxSupply);
        });
    });

    describe("Minting NFTs", function () {
        it("Should mint an NFT correctly", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Magazine A", "Author A", "Description A");

            const nftId = 1; // The first minted NFT will have ID 1
            const metadata = await nftProject.viewNFT(nftId);

            expect(metadata[0]).to.equal("Magazine A");
            expect(metadata[1]).to.equal("Author A");
            expect(metadata[2]).to.equal("Description A");
            expect(metadata[3]).to.equal(collectionName);
            expect(metadata[4]).to.equal(addr1.address);
        });

        it("Should not allow minting more than max supply", async function () {
            for (let i = 0; i < maxSupply; i++) {
                await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
                await nftProject.connect(addr1).createNFT(`Magazine ${i}`, `Author ${i}`, `Description ${i}`);
            }

            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await expect(nftProject.connect(addr1).createNFT("Magazine Overflow", "Author Overflow", "Description Overflow"))
                .to.be.revertedWith("Max supply reached");
        });

        it("Should not allow minting without enough ether", async function () {
            await expect(nftProject.connect(addr1).createNFT("Magazine A", "Author A", "Description A"))
                .to.be.revertedWith("Not enough ether to create NFT");
        });
    });

    describe("Transferring NFTs", function () {
        it("Should transfer an NFT correctly", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Magazine A", "Author A", "Description A");

            const nftId = 1; // The first minted NFT will have ID 1
            await nftProject.connect(addr1).exchangeNFT(addr2.address, nftId);

            expect(await nftProject.ownerOf(nftId)).to.equal(addr2.address);
        });

        it("Should not allow transferring an NFT by a non-owner", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Magazine A", "Author A", "Description A");

            const nftId = 1; // The first minted NFT will have ID 1
            await expect(nftProject.connect(addr2).exchangeNFT(addr1.address, nftId))
                .to.be.revertedWith("You are not the owner of this NFT");
        });

        it("Should not allow transferring to the zero address", async function () {
            await addr1.sendTransaction({ to: nftProject.address, value: mintCost });
            await nftProject.connect(addr1).createNFT("Magazine A", "Author A", "Description A");

            const nftId = 1; // The first minted NFT will have ID 1
            await expect(nftProject.connect(addr1).exchangeNFT(ethers.constants.AddressZero, nftId))
                .to.be.revertedWith("Invalid address");
        });
    });

    describe("Withdrawals", function () {
        it("Should not allow to withdraw except for the owener", async function () {
            await expect(nftProject.connect(addr1).withdraw())
                .to.be.revertedWith("Not the contract owner");
        });

        it("Should not allow withdrawing with no funds", async function () {
            await expect(nftProject.withdraw())
                .to.be.revertedWith("No funds to withdraw");
        });
    });
});
