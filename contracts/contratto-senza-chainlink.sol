// prima di change vrf chainlink

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleNFT is ERC721 {
    struct NFTMetadata {
        string magazineName; 
        string authorName; 
        string description;
        string collectionName;
    }

    uint256 public nftCount;
    uint256 public maxSupply;
    uint256 public mintCost;
    string public collectionName;
    address public owner;

    mapping(uint256 => NFTMetadata) private _NftMetadata;
    mapping(uint256 => bool) private _NftExist;

    event NFTCreated(uint256 indexed nftId, string magazineName, string authorName, string description, address indexed owner);
    event NFTTransferred(uint256 indexed nftId, address indexed from, address indexed to); // Evento di trasferimento


    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(string memory _collectionName, uint256 _maxSupply, uint256 _mintCostInEther) 
        ERC721("LucaNFT", "LNFT") 
    {
        owner = msg.sender;
        collectionName = _collectionName;
        maxSupply = _maxSupply;
        mintCost = _mintCostInEther * 1 ether;
    }


    // Creazione di un nuovo NFT
    function createNFT(string memory magazineName, string memory authorName, string memory description) public payable {
        require(nftCount < maxSupply, "Max supply reached");
        require(msg.value >= mintCost, "Not enough ether to create NFT");

        nftCount++;
        _mint(msg.sender, nftCount);
        _NftMetadata[nftCount] = NFTMetadata(magazineName, authorName, description, collectionName);
        _NftExist[nftCount] = true;
        emit NFTCreated(nftCount, magazineName, authorName, description, msg.sender);
    }

    // Visualizzazione di un NFT
    function viewNFT(uint256 nftId) public view returns (string memory magazineName, string memory authorName, string memory description, string memory collection, address ownerAddress) {
        require(_NftExist[nftId], "NFT does not exist"); // Controlla se il token esiste
        NFTMetadata storage metadata = _NftMetadata[nftId];
        return (metadata.magazineName, metadata.authorName, metadata.description, metadata.collectionName, ownerOf(nftId));
    }


    // scambio di nft
    function exchangeNFT(address to, uint256 nftId) public {
        require(msg.sender == ownerOf(nftId), "You are not the owner of this NFT");
        require(to != address(0), "Invalid address");
        _transfer(msg.sender, to, nftId);
        emit NFTTransferred(nftId, msg.sender, to);
    }


    // Owner può prelevare i fondi raccolti con i mint
    function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No funds to withdraw");
    payable(owner).transfer(balance);
}


}
