# Get Ready NFT edition

## Formal deployment handoff

The currently configured Sepolia contract is a **practice contract**, not the
formal quest deployment. For the formal release, follow
[정식 배포 및 Etherscan 검증 절차](verification/FORMAL-DEPLOYMENT.md).
Public Etherscan source verification and checking decoded Chinese `MessageLeft`
content are part of completion for the new deployment; do not stop at deployment.

The new `PKUBAGetReady` contract preserves `leaveMessage(string)` and `MessageLeft`.
The first valid message from an address also mints one ERC-721 to that address in the
same transaction. Later messages remain allowed. Transferring a souvenir does not
reset mint eligibility. Each ticket displays the original recipient's shortened
address and token ID (padded to at least four digits). Transfers do not alter its issued-to identity.

The image and JSON metadata are onchain data URIs. `public/quest-nft.svg` is the
website sample with address `0x22c2...06c6` and number `0001`; the integration test
checks `QuestArtwork` against that template with the actual recipient substituted.
The success view reads each token's image from its onchain metadata.
The artwork uses a 1100 × 1100 square canvas with viewBox `-150 -50 1100 1100`.
The original 800 × 1000 ticket remains unchanged inside it, with extra margins
for wallet galleries that crop to a square. Previously deployed artwork is immutable;
this format requires a new deployment and does not change existing NFTs.
There is no claim transaction, administrative mint, upgrade, or mint fee.
The transfer edition accepts plain ETH transfers and emits `TransferReceived`.
Only the deploying account can call `withdraw()` to send the entire ETH balance
back to itself. This authority cannot be transferred. It does not control NFTs.
Transfers do not mint NFTs or gate messages. The guide asks participants to send
0.02333 Sepolia ETH before leaving a message and save both transaction hashes.

After source verification, the deploying wallet can recover test ETH through
Sepolia Etherscan → Contract → Write Contract → Connect to Web3 → `withdraw`.
The transaction sends the full contract ETH balance to `deployer()`; it takes no
recipient or amount arguments. Use the same account that created the contract.
Never send ETH along with `leaveMessage`; plain transfers use empty calldata.
The first message costs more Sepolia gas than a repeat message.

## Deploy using MetaMask

1. Run `npm ci`, then `forge build`.
2. Run `node scripts/deploy-with-wallet.mjs`.
3. Open http://127.0.0.1:3001 in the browser with MetaMask and approve deployment.
4. The helper checks Sepolia, the creation transaction, two confirmations, and the
   deployed runtime bytecode. Only then does it update `.env.local` with the new
   address, deployment block, and `NEXT_PUBLIC_QUEST_NFT_ENABLED=true`.
5. Reload the site. Restart `npm run dev` if its environment did not reload.
   Production hosting requires these same public environment variables and a rebuild.

The previous configuration is kept in `.env.local.before-nft`. Existing messages on
the old contract remain onchain. They do not automatically mint NFTs: participants
must leave a message on the new contract. Never redeploy for each participant.

CLI alternative: use `contracts/script/DeployNFT.s.sol:DeployNFT` with a locally
configured Forge signer. Never place private keys in NEXT_PUBLIC variables.

## Verification

`forge test`, `npm test`, and `npm run test:integration` cover minting, repeat
messages, transfer eligibility, smart-account authors, invalid-message rejection,
ERC-721 ownership, metadata, and matching the website artwork.

`npm run verify-quest -- --transfer-tx 0x... --message-tx 0x...` requires two
successful Sepolia transactions after deployment: an empty-calldata transfer of
exactly 0.02333 ETH to the configured contract with a matching TransferReceived event,
followed by a MessageLeft event from that contract whose author matches the transfer
sender. Same-block order uses transaction indices. Delegated message calls remain
supported: their outer To/From may differ from the contract/event author. Both hashes
are required; the old single --tx argument is no longer supported. Organizers must
deduplicate both hashes and verify participant identity separately.

The NFT is transferable. `tokenOf` records the original recipient permanently;
`ownerOf` gives the current holder. The success view distinguishes those states.
Mint uses `_mint` without a receiver callback so the author can be a smart account
without IERC721Receiver. There is no arbitrary recipient argument. Wallet gallery
auto-discovery is not required: the site shows the souvenir and an explorer link.
