# Etherscan verification

## Transfer edition — 2026-09-23

- Contract: `0x060c21ba2cace101950464ee91ec85448678fb36`
- Deployment block: `11763617`
- Deployment transaction: `0x98c8e9d944d9f3002106d56f6d064a269f9e18f6401fa6caac084307097e5efe`
- Deployer / sole withdrawal recipient: `0x22C20845Cc25612d6daBDDd6274627f9749006c6`
- Runtime bytecode and deployer checked by the wallet deployment helper.
- Added plain ETH receipts (`TransferReceived`) and deployer-only `withdraw()`.
- Same compiler, optimizer, EVM, constructor and license settings as below.
- Etherscan verified matching bytecode and ABI on 2026-09-23; Standard JSON regenerated with 19 sources.
- Public source and ABI: https://sepolia.etherscan.io/address/0x060c21ba2cace101950464ee91ec85448678fb36#code
- Live transfer, withdrawal and first-message/NFT checks remain pending user signatures.

## Previous practice deployment

Verified on Sepolia on 2026-09-22.

This is the **practice deployment**. For the next formal contract, repeat the
[formal deployment and verification procedure](FORMAL-DEPLOYMENT.md). Generated
JSON exports are kept locally and excluded from Git; regenerate them from the
actual deployment build. Verified practice sources and ABI are public on Etherscan.

- Contract: `0x6844bcccd7959601416f5032600cdd5cb122ca85`
- Target: `contracts/src/PKUBAGetReady.sol:PKUBAGetReady`
- Compiler: `v0.8.30+commit.73712a01`
- Optimizer: enabled, 200 runs; EVM: Cancun
- Constructor arguments: none; license: MIT
- Local input export: `PKUBAGetReady.standard-input.json`
- Local ABI export: `PKUBAGetReady.abi.json`

The local runtime bytecode exactly matched the deployed runtime before submission.
Etherscan confirmed matching bytecode and ABI. Its transaction Logs view now
decodes `MessageLeft` and displays the Chinese content `我想学习 DeFi` for:
https://sepolia.etherscan.io/tx/0x325e68707abcc758fcc7ddafce4b11e1f944dde0213917dd6e1cd7292b25e960#eventlog

Source code: https://sepolia.etherscan.io/address/0x6844bcccd7959601416f5032600cdd5cb122ca85#code
