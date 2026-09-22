# PKUBA Onchain Guestbook · Get Ready

## Current NFT practice release

The current release includes the Get Ready NFT and a verified Sepolia practice
contract. For hosting this version, use [deployment/README.md](deployment/README.md)
and its public practice configuration. For the NFT contract and future formal
release, use [NFT-DEPLOYMENT.md](NFT-DEPLOYMENT.md). The original guestbook-only
contract instructions below remain as historical implementation documentation.

北京大学区块链协会技术部 · **2026 Fall Get Ready Quest**。

学生界面名称为 **PKUBA Get Ready**。主页面保留提交任务的操作；完整的中文入门指南位于 `/guide`，涵盖钱包安装、Sepolia 自动选择与手动 RPC 设置、测试币领取、留言交易、Etherscan 查询、任务提交和常见问题。首页的“入门指南”在新标签打开，避免打断当前交易；手机端也可直接访问。手动网络参数附有复制按钮。

用一次真实的智能合约交互代替简单的 Sepolia ETH 转账：学生连接 MetaMask、输入留言、确认交易，再用 Etherscan 看懂交易和事件。界面以中文为主，允许一个地址多次留言，无需数据库。

> 这是 Ethereum **Sepolia** 测试网项目（chain ID `11155111`）。Sepolia ETH 没有真实货币价值。项目不会索取助记词、私钥或钱包密码。

## 快速开始

需要 Node.js **22+**、npm。首次启动可以不配置合约：页面可正常浏览、连接钱包；写入和日志查询会明确提示等待组织者配置，不展示伪造数据。

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell 将复制命令改为：

```powershell
Copy-Item .env.example .env.local
```

打开 [http://localhost:3000](http://localhost:3000)。配置合约地址和部署区块后重启开发服务器。所有 `NEXT_PUBLIC_*` 变量在构建时写入浏览器代码；生产环境修改后需要重新构建、部署。

## 仓库结构

```text
.
├── app/                         # Next.js App Router、全局样式、图标
├── components/
│   ├── composer.tsx             # 预检查 → 钱包确认 → 回执 → 完成引导
│   ├── wallet-panel.tsx         # 连接 / 切网 / 余额 / 水龙头
│   ├── guestbook.tsx            # 分页读取链上日志
│   ├── education.tsx            # 入门步骤、词典、Etherscan 探索
│   └── providers.tsx            # wagmi + TanStack Query
├── lib/
│   ├── contract.ts              # 最小 ABI、字节校验、浏览器链接
│   ├── config.ts                # 前端环境变量和可配置水龙头
│   ├── settings.ts              # 配置校验
│   ├── wagmi.ts                 # Sepolia + MetaMask injected connector
│   ├── logs.ts                  # 有界事件查询和排序
│   ├── receipts.ts              # 回执及事件核验（UI / CLI 共用）
│   └── errors.ts                # 面向初学者的错误说明
├── contracts/
│   ├── src/PKUBAOnchainGuestbook.sol
│   ├── script/Deploy.s.sol
│   ├── test/PKUBAOnchainGuestbook.t.sol
│   └── lib/forge-std/            # 安装后生成，不提交
├── scripts/verify-quest.ts       # 组织者验收 CLI
├── tests/                       # TypeScript 单测和 Anvil 集成验证
├── foundry.toml                 # 在仓库根目录执行 forge 命令
├── .env.example
├── package.json
└── package-lock.json
```

## 架构与设计取舍

```text
学生 → MetaMask 签名 → leaveMessage(content) → Ethereum Sepolia
                              ↓
                    MessageLeft 事件日志
                              ↓
            viem getLogs → 中文公共留言板
```

- **Next.js 16 / React 19 / TypeScript strict / Tailwind CSS 4**。App Router 负责页面，钱包和查询放在客户端组件。
- **wagmi 3 + viem 2 + TanStack Query**。使用 `useConnection`、`useConnectors`、mutation 的 `mutate` / `mutateAsync`，不用旧版 `useAccount` 或已弃用的 mutation 别名。
- **只有 Sepolia**。钱包链 ID、公共 RPC 链 ID、部署脚本链 ID 均检查。错误网络不能提交。余额、回执和日志显式绑定 Sepolia，不随钱包切到主网。
- **事件为唯一留言来源**。不维护消息数组、不建数据库、不增加管理员、收费、代币或代理升级逻辑。公开访客无需连接钱包即可读留言。
- **允许重复提交**。学生可以修正想法、实验交易；每次交易独立消耗测试币 Gas。CLI 按单次交易验收，组织者自行去重。
- 写入前检查合约代码、模拟调用、估算 Gas 和费用、读取余额。Gas limit 加 20% 余量；钱包显示的最终费用仍可能受网络变化影响。低于 `0.0001` Sepolia ETH 的余额提醒只是领取引导，实际是否可提交由实时估算决定。
- `useWriteContract` 取得哈希后，`useWaitForTransactionReceipt` 等待 1 次确认；成功需同时满足回执成功、正确合约发出事件、事件 sender 与提交时钱包一致、事件 content 与提交内容一致。加速替换交易使用最终回执哈希；取消或改变内容不算完成。
- 交易等待期间不能再次提交；RPC 超时保留交易哈希和“重新查询”按钮，避免把超时当失败重发。回执成功后刷新留言和余额。

## 合约行为

```solidity
event MessageLeft(address indexed sender, string content, uint256 timestamp);
function leaveMessage(string calldata content) external;
```

合约使用 Solidity `0.8.30`、Cancun EVM 和 optimizer 200 runs。

- 长度为 0：`EmptyMessage()`。
- 大于 280 **UTF-8 字节**：`MessageTooLong()`。
- 成功：发出一次事件，包含 `msg.sender`、原始留言和 `block.timestamp`（Unix 秒）。
- 不存储消息列表，不接收 ETH；支付给网络的是交易 Gas。
- 中文通常占 3 字节、常见 Emoji 占 4 字节。前端使用 `TextEncoder`，与 Solidity `bytes(content).length` 对齐。
- 合约允许纯空格和任意非空字节；前端额外拒绝纯空白输入，但不会偷偷裁剪用户内容。这保持合约可读性，不把 Unicode 处理搬进链上。
- `sender` 为调用者；通过其他合约调用时会记录该合约地址。本任务限定直接从钱包调用。

## Foundry 安装与测试

先按照 [Foundry 官方安装说明](https://getfoundry.sh/introduction/installation/) 安装。macOS/Linux 或 Windows **Git Bash / WSL**：

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

重新打开终端，确认 `forge --version` 和 `anvil --version` 可用。在**仓库根目录**安装固定版测试库：

```bash
forge install foundry-rs/forge-std@v1.9.7 --no-git
forge build
forge test
```

Foundry 配置已映射 `contracts/src`、`contracts/script`、`contracts/test`，无需 `cd contracts`。首次构建会下载 solc，需要联网。

9 项合约测试覆盖正常消息、空消息、超长消息、280 字节边界、中文、UTF-8 超限、正确 sender/content/timestamp、重复消息、拒绝 ETH 和 256 轮 fuzz 校验。

前端和业务验证：

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:integration
```

`test:integration` 需要 Foundry/Anvil，在专用端口 `18545` 启动临时本地链。测试会部署合约、提交中文和重复消息、读取排序日志、调用验收 CLI，并拒绝错误钱包和普通转账。只用 Anvil 的临时解锁账户；不会使用 `.env.local` 的私钥，不会发送 Sepolia 交易。该端口需要空闲。

## 环境变量

| 名称                                     | 必须           | 用途                                                           |
| ---------------------------------------- | -------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS` | 上线必须       | Sepolia 合约地址，不能是零地址或钱包地址                       |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL`            | 推荐           | 浏览器可调用的 HTTP(S) RPC，默认 PublicNode；生产建议独立配额  |
| `NEXT_PUBLIC_DEPLOYMENT_BLOCK`           | 上线必须       | 合约部署交易所在区块，十进制整数；不要误填当前区块             |
| `NEXT_PUBLIC_LOG_CHUNK_SIZE`             | 可选           | 每个 `eth_getLogs` 请求最大区块数，默认 `2000`，范围 `1–10000` |
| `NEXT_PUBLIC_GOOGLE_FAUCET_URL`          | 可选           | 默认 Google Cloud Sepolia 水龙头                               |
| `NEXT_PUBLIC_FAUCET_DIRECTORY_URL`       | 可选           | 默认 Ethereum.org Sepolia 网络/水龙头目录                      |
| `SEPOLIA_RPC_URL`                        | 部署必须       | Foundry 和验收 CLI 使用的 Sepolia RPC；CLI 可退回前端 RPC      |
| `PRIVATE_KEY`                            | CLI 私钥部署时 | 仅用于组织者的独立部署钱包；更推荐 keystore 方式               |
| `ETHERSCAN_API_KEY`                      | 合约验证必须   | Etherscan 验证 API key，保留在本机部署环境                     |

只将前三个（及可选前端参数）配置到 Vercel。**不要把 `PRIVATE_KEY` 放入 Vercel，也不要给它添加 `NEXT_PUBLIC_` 前缀。** 带 API key 的前端 RPC URL 对访客公开，应在 RPC 服务商处设置域名限制和合理限额。变量文件已加入 `.gitignore`。

水龙头：

- [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [Ethereum.org Sepolia 网络与水龙头目录](https://ethereum.org/en/developers/docs/networks/#sepolia)

领取条件和配额由各服务商决定。无需购买测试币。

## 部署到 Ethereum Sepolia

本项目没有预置部署地址。组织者使用独立测试钱包、领取部署所需的 Sepolia ETH，在本机 `.env` 填入 `SEPOLIA_RPC_URL`、`PRIVATE_KEY`、`ETHERSCAN_API_KEY`。**不要将这个文件提交到 Git。**

以下为仓库根目录的 **Bash / Git Bash / WSL** 命令。仅 source 自己创建并检查过的 `.env`：

```bash
set -a
source .env
set +a

forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --chain sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key "$ETHERSCAN_API_KEY"
```

私钥方式适合临时测试钱包，CLI 参数可能被本机其他进程看到。更推荐使用 Foundry 加密 keystore（交互输入私钥，避免出现在命令历史中）：

```bash
cast wallet import pkuba-sepolia --interactive

forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --account pkuba-sepolia \
  --chain sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key "$ETHERSCAN_API_KEY"
```

脚本主动拒绝非 `11155111` 的网络。部署只创建一个合约，没有 owner 初始化或构造参数。

从 Forge 输出或 `broadcast/Deploy.s.sol/11155111/run-latest.json` 记录 **contractAddress、部署 transactionHash、receipt.blockNumber**。需要时查询部署回执：

```bash
cast receipt <DEPLOYMENT_TX_HASH> --rpc-url "$SEPOLIA_RPC_URL"
```

将区块号转为十进制，写入 `.env.local`：

```dotenv
NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS=0x实际部署的合约地址
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://你的SepoliaRPC
NEXT_PUBLIC_DEPLOYMENT_BLOCK=实际部署区块的十进制整数
```

这些是需替换的说明占位符，不是可直接运行的配置。确认地址在 Sepolia Etherscan 有合约代码，并核对 `leaveMessage` 和 `MessageLeft`。

### 单独重新验证合约源码

若广播成功但 Etherscan 尚未索引，不要重复部署。稍后执行：

```bash
forge verify-contract <DEPLOYED_CONTRACT_ADDRESS> \
  contracts/src/PKUBAOnchainGuestbook.sol:PKUBAOnchainGuestbook \
  --chain sepolia \
  --etherscan-api-key "$ETHERSCAN_API_KEY" \
  --watch
```

保留相同源码和 `foundry.toml` 编译设置。编译器版本、optimizer 或 EVM 设置改变可能导致验证不匹配。参考 [Foundry 合约验证](https://getfoundry.sh/forge/deploying/)。

## 本地运行与 Vercel 部署

```bash
npm run dev
# 生产构建与本地预览
npm run build
npm start
```

Vercel 操作：

1. 将完整代码和 `package-lock.json` 推送到组织者自己的 Git 仓库，检查没有提交环境变量、私钥、`node_modules`、`contracts/lib` 或广播文件。
2. 在 Vercel 导入仓库，Framework Preset 选 **Next.js**，根目录为本仓库根目录，Node.js 选 **22.x** 或兼容的更新版本。
3. 填写前端环境变量：合约地址、RPC、部署区块，以及需要的可选变量。无需上传合约部署私钥。
4. Build Command 为 `npm run build`，Install Command 为 `npm ci`，输出目录使用 Next.js 默认值。
5. 部署后，用独立测试钱包实际完成一次连接 → 切网 → 留言 → Etherscan → CLI 验收。确认 RPC 支持网站域名的 CORS。
6. 将正式活动 URL 发给学生。每次改动 `NEXT_PUBLIC_*` 都重新部署。

无服务端数据库、账户系统或后台任务。网页源代码与合约部署是两个独立步骤。

## 可选留言历史模块（当前页面未启用）

当前页面聚焦留言提交与单笔交易确认，不展示公共留言列表，也没有“查看留言”导航。`components/guestbook.tsx` 和日志读取工具保留为可选模块，下述机制仅在挂载该组件时启用。界面采用白底、深红色强调，页脚为 “Less Trust, More Truth”。

`lib/logs.ts` 使用 viem `getLogs`，限定正确合约和 `MessageLeft` 事件；只接收完整、已挖出且未 removed 的日志。

- 初次读取从最新区块向后走，**每个请求最多 2000 区块、每页最多 3 个请求**。可通过 `NEXT_PUBLIC_LOG_CHUNK_SIZE` 降低 RPC 范围。
- 已读到至少 20 条时提前结束当前页，但不会丢弃同一个区块范围中剩余的事件。
- 点击“读取更早的区块”延续上页游标；最低不越过部署区块。同一区块按 `logIndex` 倒序。
- 最新查询结果在内存中缓存 30 秒，无自动全历史轮询；用户刷新或交易完成时更新。刷新也会重读已经打开的分页，因此大量历史页会增加 RPC 调用。
- 空白区块很多时，页面明确说“已读取的区块中还没有留言”，并提供继续读取按钮，不把部分查询误报为全站无留言。
- 数据失败显示错误和重试，不填充假留言。RPC 报范围限制时缩小 chunk（有些套餐只有 10 区块），或更换支持更大范围的服务商。
- RPC 本身每次先检查真实链 ID；部署区块高于链头会报配置错误。

这是活动规模的 MVP。公共 RPC 没有可用性承诺，访客并发较多时应配置 Alchemy、Infura、QuickNode、PublicNode 等的独立服务。长期运行数月后，早期消息需要多次点击读取；生产大规模长期站点可再加事件索引服务，当前不引入数据库。

界面等待 1 次确认，极少数链重组可能使刚显示的消息暂时消失。刷新会重取日志；活动最终验收可在多几个区块后重跑脚本。

## 组织者验收脚本

在 `.env.local` / `.env` 或 shell 中配置 RPC、合约地址和部署区块：

```bash
npm run verify-quest -- --tx 0x完整交易哈希
```

Windows PowerShell 传递带 `--` 的脚本参数时，使用 `npm.cmd` 以避免 `npm.ps1` 的参数转发差异：

```powershell
npm.cmd run verify-quest -- --tx 0x完整交易哈希
```

脚本严格检查：RPC 链为 Sepolia、交易链 ID（存在时）、交易可查询、回执成功、目标为配置合约，以及**该合约**的 `MessageLeft` 事件 sender 与交易发送者匹配。学生只需提交交易哈希；发送地址直接从链上交易读取。第三方伪造同名事件、普通转账、失败交易、其他合约的交易不会通过。

成功输出示例：

```text
✓ Ethereum Sepolia network
✓ Transaction found
✓ Transaction succeeded
✓ Correct PKUBA contract
✓ MessageLeft event found
✓ Sender matches

Message: "Hello PKUBA!"
Block: ...
Transaction: 0x...

Quest verified successfully.
```

任何检查失败返回进程退出码 `1`，说明失败项目；成功为 `0`。未挖出的交易提示稍后再查。交易哈希是公开信息，不需要学生发送钱包地址或私钥。

CLI 不证明这个地址属于某个真实学生，也不阻止一笔有效交易被多次提交。组织者将学号/身份在既有活动渠道核对，并按交易哈希去重即可；不要让学生把学号、手机号等写到公开留言里。

## 推荐新生活动流程

1. 安装官方 MetaMask。
2. 创建独立测试钱包，在本地安全保存助记词，不发送给任何人。
3. 打开测试网络显示，切换到 Ethereum Sepolia。
4. 从官方水龙头领取少量 Sepolia ETH。
5. 打开活动页，连接钱包。
6. 输入一条不含个人隐私的留言。
7. 点击“写入链上”，在钱包中核对网络和合约地址，确认交易。
8. 等待成功卡片，打开 Sepolia Etherscan；探索 From、To、Tx Hash、Block、Gas Fee、Input Data、Logs。
9. 在组织者指定渠道提交完整的 **交易哈希**。

组织者可展示极简合约源码，让学生比较“存储状态”与“发出事件”，并观察重复留言产生不同交易哈希。

## 安全与已知边界

- 永远不收集助记词、私钥和钱包密码；组织者也不例外。仅部署者自行在本机管理签名密钥。
- 留言公开且无法从链上删除，没有管理员删除、内容审核或垃圾信息过滤。上线前告知学生不要填写隐私；这是教学 MVP，不是面向陌生人的审核平台。
- React 按普通文本渲染留言，不使用 `dangerouslySetInnerHTML`。
- 不收取 ETH，不要求授权代币，不支持主网。不需要真实资产。
- MetaMask 手机 App 可通过内置浏览器访问；普通手机浏览器未安装 injected provider 时会给出安装提示。本版没有 WalletConnect。
- 待确认交易状态保存在当前页面会话中，刷新后不会自动恢复。已广播交易依然有效，可从 MetaMask 活动或 Etherscan 找回哈希，不要因刷新盲目重发。
- 钱包拒绝、余额不足、错链、RPC 故障、合约回退和替换交易分别处理。预检查不是绝对费用承诺，钱包余额和网络费用仍可能变化。
- 未执行真实 Sepolia 部署或代用户签名。实际活动上线仍需组织者填入真实配置、验证源码并完成一次真实钱包冒烟测试。

## 相关文档

- [wagmi React 入门与当前 API](https://wagmi.sh/react/getting-started)
- [viem getLogs](https://viem.sh/docs/actions/public/getLogs)
- [Foundry](https://getfoundry.sh/)
- [Ethereum Sepolia](https://ethereum.org/en/developers/docs/networks/#sepolia)
- [Next.js on Vercel](https://nextjs.org/docs/app/getting-started/deploying)
