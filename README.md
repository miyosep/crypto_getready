# PKUBA Get Ready Quest

北京大学区块链协会技术部的 Sepolia 入门任务。参与者用 MetaMask 向任务合约发送 **0.02333 Sepolia ETH**，再从同一地址提交一条链上留言，最后提供两笔交易的完整哈希。首次成功留言会在同一笔交易中铸造一枚 Get Ready 纪念 NFT。

- 活动网站：[crypto-getready.vercel.app](https://crypto-getready.vercel.app/)
- 参与者指南：[网站内的入门指南](https://crypto-getready.vercel.app/guide)
- 网络：Ethereum Sepolia，chain ID `11155111`；所用 ETH 是测试币。
- 当前网站使用[已验证的练习合约](deployment/README.md)。正式活动如需部署新合约，请先阅读[正式部署流程](verification/FORMAL-DEPLOYMENT.md)。

## 本地运行

需要 Node.js **22.12+** 和 npm。

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Windows PowerShell 请用 `Copy-Item .env.example .env.local` 复制环境变量模板，然后打开 [http://localhost:3000](http://localhost:3000)。公开的任务合约地址、部署区块和 NFT 开关已保存在 [`deployment/practice-config.json`](deployment/practice-config.json)，本地运行时会自动读取，无需复制到 `.env.local`。

| 变量 | 作用 |
| --- | --- |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | 浏览器可访问的 Sepolia RPC |

其他可选项见 [`.env.example`](.env.example)。如需临时测试另一份部署，仍可用同名 `NEXT_PUBLIC_*` 环境变量覆盖公开配置；这些变量会写入浏览器构建产物，并不保密。私钥和 `ETHERSCAN_API_KEY` 不属于网站配置，不要提交到 Git 或上传到 Vercel。

## 任务如何运作

1. 参与者在 Sepolia 上向网站显示的合约地址直接转账 **0.02333 ETH**，保存转账哈希。
2. 使用同一地址连接 MetaMask，提交不超过 **280 UTF-8 字节**的留言，保存留言哈希。两步都需要链上确认。
3. 合约发出 `TransferReceived` 和 `MessageLeft` 事件。一个地址的首次有效留言还会铸造一枚 ERC-721；后续留言仍可提交，但不会重复铸造。
4. 组织者用两个交易哈希运行验收脚本，并在活动渠道核对参与者身份与重复提交情况。

转账和留言是独立交易。留言保存在公开事件日志中，NFT 的图片与元数据由合约生成。网站没有用户账户或数据库；当前页面也没有挂载公共留言历史列表。

## 开发与测试

前端使用 Next.js 16、React 19、TypeScript、wagmi 和 viem。合约在 `contracts/src/PKUBAGetReady.sol`，网页在 `app/` 与 `components/`，交易核验逻辑在 `lib/quest-verification.ts`。

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

合约测试需要 [Foundry](https://getfoundry.sh/introduction/installation/) 的 `forge` 和 `anvil`。首次在仓库根目录安装测试依赖：

```bash
forge install foundry-rs/forge-std@v1.9.7 --no-git
forge build
forge test
npm run test:integration
```

`test:integration` 在本机临时 Anvil 链上部署合约，检查转账、留言、NFT 与双交易验收；不使用 `.env.local` 的私钥，也不发送 Sepolia 交易。该测试需要端口 `18545` 空闲。

## 组织者验收

先在 `.env.local`、`.env` 或 shell 中配置合约地址、部署区块，以及 `SEPOLIA_RPC_URL` 或 `NEXT_PUBLIC_SEPOLIA_RPC_URL`。然后运行：

```bash
npm run verify-quest -- --transfer-tx 0x转账哈希 --message-tx 0x留言哈希
```

Windows PowerShell 使用 `npm.cmd run verify-quest -- --transfer-tx 0x转账哈希 --message-tx 0x留言哈希`。

脚本要求两笔不同且成功的 Sepolia 交易，均发生在合约部署之后。转账必须以空 calldata 向配置的合约直接发送恰好 `0.02333 ETH`，并产生匹配的 `TransferReceived` 事件。留言交易必须发生在转账之后，且该合约发出的 `MessageLeft` 作者必须与转账发送者相同。脚本成功时退出码为 `0`，失败时为 `1`。

脚本不能证明钱包属于哪位参与者，也不会记录已使用的哈希。组织者应在活动渠道核对身份，并分别对转账哈希与留言哈希去重。不要要求参与者在公开留言中填写姓名、学号或联系方式。

## 部署网站

当前练习版使用 [`deployment/practice-config.json`](deployment/practice-config.json) 中的公开配置；只更新网站时无需重新部署合约。Vercel 项目的根目录为仓库根目录，使用 `npm ci` 安装、`npm run build` 构建，并采用 Next.js 默认输出。将四项公开配置设为环境变量后部署，检查首页与 `/guide` 显示同一个 Sepolia 合约地址。

新合约的部署、Etherscan 源码验证及 NFT 细节分别见 [正式部署流程](verification/FORMAL-DEPLOYMENT.md) 和 [NFT 文档](NFT-DEPLOYMENT.md)。

## 使用边界

- 仅使用 Sepolia 测试网。MetaMask 会逐笔请求用户确认；网站不会替用户签名。
- 留言一旦上链便公开且无法撤回。合约没有内容审核或删除功能。
- 页面刷新后不会自动恢复正在等待的交易状态；可从 MetaMask、Etherscan 或 Blockscout 找回交易哈希，核对后再决定是否重发。
- 连接钱包、读取回执和查询事件依赖浏览器及 Sepolia RPC 的可用性。
