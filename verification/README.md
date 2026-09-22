# Etherscan verification

Verified on Sepolia on 2026-09-22.

This is the **practice deployment**. For the next formal contract, repeat the
[formal deployment and verification procedure](FORMAL-DEPLOYMENT.md). These JSON
files record this practice build; regenerate them from the actual formal build.

- Contract: `0x6844bcccd7959601416f5032600cdd5cb122ca85`
- Target: `contracts/src/PKUBAGetReady.sol:PKUBAGetReady`
- Compiler: `v0.8.30+commit.73712a01`
- Optimizer: enabled, 200 runs; EVM: Cancun
- Constructor arguments: none; license: MIT
- Input: `PKUBAGetReady.standard-input.json`
- ABI: `PKUBAGetReady.abi.json`

The local runtime bytecode exactly matched the deployed runtime before submission.
Etherscan confirmed matching bytecode and ABI. Its transaction Logs view now
decodes `MessageLeft` and displays the Chinese content `我想学习 DeFi` for:
https://sepolia.etherscan.io/tx/0x325e68707abcc758fcc7ddafce4b11e1f944dde0213917dd6e1cd7292b25e960#eventlog

Source code: https://sepolia.etherscan.io/address/0x6844bcccd7959601416f5032600cdd5cb122ca85#code
