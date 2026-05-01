// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract dNFT3 is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using Strings for uint256;

    uint256 public nextTokenId;
    string public baseURI;
    uint256 public totalSupply;
    uint256 public siteVisits;

    mapping(uint256 => uint256) public tokensSiteVisits;

    uint256[50] private __gap;

    event MintedNFT(uint256 tokenId, address owner);
    event PointsUpdated(uint256 tokenId, uint256 points);
    event UpdatedMetadata(uint256 tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory baseURI_) public initializer {
        baseURI = baseURI_;
        __ERC721_init("Galaxy NFT", "GNFT");
        __Ownable_init(msg.sender);
        siteVisits = 10;
        totalSupply = 14;
    }

    function mint() public payable {
        require(nextTokenId < totalSupply, "All 14 NFTs have been minted");
        require(balanceOf(msg.sender) == 0, "Already minted one NFT");
        require(msg.value == 0.0001 ether, "Requires exactly 0.0001 ether");
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        tokensSiteVisits[tokenId] = 0;
        nextTokenId++;
        emit MintedNFT(tokenId, msg.sender);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }


    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (tokensSiteVisits[tokenId] < siteVisits) {
            return string(abi.encodePacked(baseURI, "0.json"));
        } else {
            return string(abi.encodePacked(baseURI, (tokenId + 1).toString(), ".json"));
        }
    }

    function _update(address to, uint256 tokenId, address auth)
        internal virtual override returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: cannot transfer this NFT");
        }
        return super._update(to, tokenId, auth);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
    }

    function updatePoints(uint256 tokenId, uint256 points) public onlyOwner {
            tokensSiteVisits[tokenId] = tokensSiteVisits[tokenId] + points;

            emit PointsUpdated(tokenId, tokensSiteVisits[tokenId]);
            emit UpdatedMetadata(tokenId);
    }

    function recordVisit(uint256 tokenId) public onlyOwner {
        _requireOwned(tokenId);
        _updatePoints(tokenId);
    }

    function exploreGalaxy(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not your NFT");
        _updatePoints(tokenId);
    }

    function _updatePoints(uint256 tokenId) internal {
        tokensSiteVisits[tokenId] += 1;
        emit PointsUpdated(tokenId, tokensSiteVisits[tokenId]);
        emit UpdatedMetadata(tokenId);
    }

    function setSiteVisits(uint256 num) public onlyOwner(){
        siteVisits = num;
    }

    function _authorizeUpgrade(address newImpl) internal override onlyOwner {}
}