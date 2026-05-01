# Understanding Dynamic NFTs

## What is an NFT?

A standard NFT (Non-Fungible Token) is a unique digital asset recorded on a blockchain. Once minted, its metadata (image, attributes, description) is fixed — it never changes. A link to a JSON file stored on IPFS describes the token, and that file stays the same forever.

## What is a Dynamic NFT?

A Dynamic NFT (dNFT) is an NFT whose metadata can change over time based on external conditions, on-chain events, or owner/contract interactions. Instead of pointing to a static JSON file, the NFT's `tokenURI` logic updates to return different metadata depending on the current state of the contract.

The core mechanism is overriding the `tokenURI` function to return different content based on on-chain data — exactly what this project does:

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    if (tokensSiteVisits[tokenId] < 15) {
        return string(abi.encodePacked(baseURI, "0.json")); // beginner metadata
    } else {
        return string(abi.encodePacked(baseURI, "1.json")); // advanced metadata
    }
}
```

The image and traits a holder sees change based on their `tokensSiteVisits` score — that is a dynamic NFT.

## Why Use Dynamic NFTs?

Static NFTs are great for representing ownership of something fixed (art, collectibles). But many real-world assets and relationships are not static — they evolve. Dynamic NFTs solve this by:

- **Reflecting real-world state** — the NFT mirrors something that changes (a player's level, a real estate deed, a loan status).
- **Enabling progression systems** — holders can earn or lose traits by participating in an ecosystem.
- **Reducing re-minting costs** — instead of burning and reminting an NFT to update it, you update the underlying data and the metadata follows automatically.
- **Connecting on-chain and off-chain data** — through oracles (like Chainlink), dynamic NFTs can react to real-world events (sports scores, weather, price feeds).

## Use Cases

### 1. Gaming and Play-to-Earn
A character NFT starts as a level-1 novice. As the player wins battles, completes quests, or accumulates XP, the NFT's image and stats update to reflect their progression. The NFT is a live record of the player's achievement.

### 2. Loyalty and Rewards Programs
A membership NFT tracks how many times a customer visits a store or uses a service (similar to this project's `tokensSiteVisits`). After hitting a threshold, the NFT upgrades to a Gold or Platinum tier, unlocking new benefits automatically.

### 3. Real-World Asset (RWA) Tokenization
A tokenized property deed can update its metadata to reflect changes in ownership history, valuation, or mortgage status. A tokenized invoice NFT can show whether it has been paid or is still outstanding.

### 4. Sports and Collectibles
A footballer's NFT card updates its stats (goals, assists, rating) after each match using a sports data oracle. The NFT becomes a live trading card rather than a frozen snapshot.

### 5. DeFi Positions
A lending protocol can represent a user's loan as an NFT. The NFT metadata reflects the current health factor, collateral ratio, and liquidation risk — all changing with market prices.

### 6. Certificates and Credentials
An educational certificate NFT starts as "In Progress" and updates to "Completed" once a student finishes a course. Professional licenses can expire or get renewed automatically based on on-chain logic.

### 7. Insurance Policies
An insurance policy represented as a dNFT can update its status (active, expired, claimed) and terms over time, making the NFT itself the live policy document.

## How Metadata Updates Work

There are two common patterns:

| Pattern | How it works |
|---------|-------------|
| **On-chain state** | Contract variables (like `tokensSiteVisits` in this project) determine which metadata URI is returned. No external call needed. |
| **Oracle-fed** | A Chainlink oracle pushes real-world data on-chain, which the contract reads when computing `tokenURI`. |

## Key Takeaway

A dynamic NFT closes the gap between a token and a living digital identity. Instead of being a receipt for something that happened once, it becomes an ongoing record of a relationship, an achievement, or a real-world state — making NFTs genuinely useful beyond speculation and art collecting.
