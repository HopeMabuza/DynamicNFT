# ERC-721 Contract — Explained Like You're Human

> A practical, no-fluff breakdown of how ERC-721 NFT contracts work, with real code snippets.

---

## Big Picture: What Even Is This?

ERC-721 is the **NFT standard** on Ethereum.

Think of it like a system that:
- Keeps track of **unique digital items** (NFTs)
- Records **who owns them**
- Controls **how they can be moved**

Each NFT is:
- **Unique** (unlike ERC-20 tokens which are all identical)
- Identified by a **tokenId**
- Owned by **one address at a time**

**The whole contract in one sentence:**
> *"For every tokenId, store who owns it, allow transferring it, and control who is allowed to move it."*

---

## Storage — The Core "Databases"

These four mappings are the heart of every ERC-721 contract:

```solidity
mapping(uint256 tokenId => address) private _owners;
mapping(address owner => uint256) private _balances;
mapping(uint256 tokenId => address) private _tokenApprovals;
mapping(address owner => mapping(address operator => bool)) private _operatorApprovals;
```

| Mapping | What it stores |
|---|---|
| `_owners[tokenId]` | Who owns this NFT |
| `_balances[user]` | How many NFTs this user has |
| `_tokenApprovals[tokenId]` | Who can transfer this **specific** NFT |
| `_operatorApprovals[user][operator]` | Who can manage **all** of a user's NFTs |

The contract is basically just **tracking ownership + permissions**. That's it.

---

## Name & Symbol

```solidity
string private _name;
string private _symbol;
```

- `_name` → e.g. `"BoredApeYachtClub"`
- `_symbol` → e.g. `"BAYC"`

---

## Reading Data (View Functions)

### Who owns an NFT?

```solidity
function ownerOf(uint256 tokenId) public view returns (address)
```

> "Who owns token #42?"

---

### How many NFTs does someone have?

```solidity
function balanceOf(address owner) public view returns (uint256)
```

> "How many NFTs does this wallet hold?"

---

### NFT Metadata Link

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory)
```

Returns a URL like:

```
ipfs://QmABC123/1
```

This URL points to a JSON file containing the NFT's image, description, and attributes. More on this below.

---

## Transfers — Moving NFTs

### Basic Transfer

```solidity
function transferFrom(address from, address to, uint256 tokenId) public
```

> "Move NFT from wallet A → wallet B"

You must be the owner **or** an approved address to call this.

---

### Safe Transfer

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) public
```

Same as above, but also **checks if the receiver is a smart contract** and whether that contract can handle NFTs. This prevents NFTs from getting permanently stuck.

---

## Approvals — The Permission System

### Approve One Specific NFT

```solidity
function approve(address to, uint256 tokenId) public
```

> "I'm letting *this address* transfer token #5 on my behalf."

---

### Approve All Your NFTs

```solidity
function setApprovalForAll(address operator, bool approved) public
```

> "I'm letting *this address* manage every NFT I own."

This is commonly used by NFT marketplace contracts.

---

## Internal Logic — The Real Engine

### `_update()` — The Most Important Function

```solidity
function _update(address to, uint256 tokenId, address auth) internal
```

This is the function that **actually moves NFTs**. Everything else calls this under the hood. It:

1. Removes the NFT from the old owner
2. Adds the NFT to the new owner
3. Updates both balances
4. Emits the `Transfer` event

Minting, burning, and transferring all go through `_update()`.

---

### Minting — Creating NFTs

```solidity
function _mint(address to, uint256 tokenId) internal
```

> Creates a brand new NFT and assigns it to `to`.

Before: no owner exists for this tokenId.
After: `to` owns it.

---

### Safe Mint

```solidity
function _safeMint(address to, uint256 tokenId) internal
```

Same as `_mint`, but also checks the receiver can handle NFTs (safer for contracts).

---

### Burning — Destroying NFTs

```solidity
function _burn(uint256 tokenId) internal
```

> Permanently deletes the NFT. The tokenId is gone forever.

---

## Why Is It `abstract`?

```solidity
abstract contract ERC721 { ... }
```

Because ERC-721 gives you the **logic**, but not the product. You still need to build on top of it:

- Add your own `mint()` function
- Define your `_baseURI()`
- Set rules (price, max supply, whitelist, etc.)

Think of ERC-721 as a template — you fill in the specifics.

---

## Base URI vs Token URI — Explained Simply

This confuses almost everyone at first.

**The core idea:**
- **Base URI** = the common part of the link, shared by all NFTs
- **Token URI** = the full link for ONE specific NFT

### Think of it like a folder

```
https://my-nft.com/metadata/      ← Base URI (the folder)

https://my-nft.com/metadata/1     ← Token URI for NFT #1
https://my-nft.com/metadata/2     ← Token URI for NFT #2
https://my-nft.com/metadata/3     ← Token URI for NFT #3
```

### In code

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    string memory baseURI = _baseURI();
    return string.concat(baseURI, tokenId.toString());
}
```

So: `tokenURI = baseURI + tokenId`

---

### Real World Example

Base URI:
```
ipfs://QmABC123/
```

Token URIs:
```
ipfs://QmABC123/1
ipfs://QmABC123/2
ipfs://QmABC123/3
```

When you open `ipfs://QmABC123/1`, you get a JSON file like this:

```json
{
  "name": "My NFT #1",
  "description": "This is NFT number 1",
  "image": "ipfs://QmImageHash/1.png",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" }
  ]
}
```

That JSON file **is** the metadata.

---

### Comparison Table

| Concept | Meaning |
|---|---|
| `baseURI` | The shared prefix for all NFTs |
| `tokenURI` | The full unique link for one NFT |

---

### Why Even Use baseURI?

It's **cheaper and cleaner**. Instead of storing a full URL per NFT (expensive on-chain), you just store one base URI and compute the rest:

```solidity
// ❌ Expensive: storing full URL per token
_tokenURIs[1] = "ipfs://QmABC123/1";
_tokenURIs[2] = "ipfs://QmABC123/2";

// ✅ Cheap: store once, compute on the fly
function _baseURI() internal pure override returns (string memory) {
    return "ipfs://QmABC123/";
}
```

---

### Overriding `_baseURI()` in Your Contract

```solidity
function _baseURI() internal pure override returns (string memory) {
    return "ipfs://QmABC123/";
}
```

Or override `tokenURI()` directly if you need custom logic — for example:
- Dynamic NFTs that change over time
- Different metadata per token
- Pulling from an off-chain API

---

## Mental Model Cheat Sheet

| NFT Concept | Real-World Equivalent |
|---|---|
| `tokenId` | Serial number on a product |
| `owner` | The person holding the item |
| `transfer` | Handing the item to someone else |
| `approve` | Giving someone permission to hand it over |
| `mint` | Manufacturing the item |
| `burn` | Destroying the item |
| `baseURI` | The folder / directory |
| `tokenURI` | The exact file inside that folder |

---

## Final Summary

ERC-721 is:

1. A **mapping of tokenId → owner** (who has what)
2. A **transfer system** (how ownership changes hands)
3. A **permission system** (who else is allowed to move tokens)
4. A **metadata link** via `tokenURI` (image, name, attributes)

And `tokenURI` is just: **baseURI + tokenId** pointing to a JSON file on IPFS.

---