// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract nftProject is ERC721, VRFConsumerBaseV2 {
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
    mapping(uint256 => address) private requestToSender;


    // variabili chainlink
    VRFCoordinatorV2Interface COORDINATOR = VRFCoordinatorV2Interface(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B);
    uint64 subscriptionId = 649801; //solo prima cifre per evitare errore uint64
    bytes32 keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 2;
    uint32 numWords = 1;

    event NFTCreated(uint256 indexed nftId, string magazineName, string authorName, string description, address indexed owner);
    event NFTTransferred(uint256 indexed nftId, address indexed from, address indexed to);
    event NFTTransferredFrom(uint256 indexed nftId, address indexed from, address indexed to);
    event RandomnessRequested(uint256 requestId, address indexed requester);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(
        string memory _collectionName,
        uint256 _maxSupply,
        uint256 _mintCostInGwei
    ) ERC721("LucaNFT", "LNFT") VRFConsumerBaseV2(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B) {
        owner = msg.sender;
        collectionName = _collectionName;
        maxSupply = _maxSupply;
        mintCost = _mintCostInGwei * 1 gwei;
    }

    function createNFT(string memory magazineName, string memory authorName, string memory description) public payable {
        require(nftCount < maxSupply, "Max supply of NFT reached");
        require(msg.value >= mintCost, "Not enough gwei to create NFT, you need at least one gwei to mint an nft");

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        requestToSender[requestId] = msg.sender;
        emit RandomnessRequested(requestId, msg.sender);
        _NftMetadata[requestId] = NFTMetadata(magazineName, authorName, description, collectionName);
    }


    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 nftId = randomWords[0] % maxSupply + 1;

        require(!_NftExist[nftId], "NFT ID already exists");

        address nftOwner = requestToSender[requestId];
        _mint(nftOwner, nftId);
        _NftExist[nftId] = true;
        nftCount++;

        NFTMetadata memory metadata = _NftMetadata[requestId];
        _NftMetadata[nftId] = metadata;
        emit NFTCreated(nftId, metadata.magazineName, metadata.authorName, metadata.description, nftOwner);
    }



    function viewNFT(uint256 nftId) public view returns (string memory magazineName, string memory authorName, string memory description, string memory collection, address ownerAddress) {
        require(_NftExist[nftId], "NFT dont exist");
        NFTMetadata storage metadata = _NftMetadata[nftId];
        return (metadata.magazineName, metadata.authorName, metadata.description, metadata.collectionName, ownerOf(nftId));
    }

    function exchangeNFT(address to, uint256 nftId) public {
        require(msg.sender == ownerOf(nftId), "You are not the owner of this NFT");
        require(to != address(0), "Invalid address");
        _transfer(msg.sender, to, nftId);
        emit NFTTransferred(nftId, msg.sender, to);
    }

    function transferFrom(address from, address to, uint256 nftId) public onlyOwner override {
    require(_NftExist[nftId], "Nft dont exist");
    _transfer(from, to, nftId);
    emit NFTTransferredFrom(nftId, from, to);
}


    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }
}
