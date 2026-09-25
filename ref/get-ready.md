# 🌟PKUBlockchain🌟 25 Fall Get Ready Quest
欢迎加入 **北大链协技术部**！🎉

这份热身任务的目的，是希望帮助从未接触过链上操作的同学，完成**人生第一笔链上交易**。别担心，我们会手把手引导你完成。对于已经体验过的老玩家，这个任务也会非常轻松。

最终目标是：在 **Ethereum Sepolia 测试网**上，向指定的**特殊地址**
```
0xE2a73c8E3Af6379fa58e477B0e2129f21E023010
```
转账 **0.0233 ETH**，并提交交易哈希（tx hash）。

## 1 Install metamask
### 什么是区块链钱包？
在区块链世界里，你需要一个“钱包”来管理你的数字资产。钱包并不是存放币的地方，而是帮助你安全保管和使用 **私钥** 的工具。拥有私钥，就意味着拥有链上资产的控制权。

### 什么是 MetaMask？
MetaMask 是目前最常用的区块链钱包插件，它能让你在浏览器里方便地与各种去中心化应用（DApp）交互。

- 👉 [MetaMask 官网下载](https://metamask.io/download)：下载浏览器扩展插件
- 👉 [Chrome 插件商店直链](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)

 初始化钱包时会生成一个钱包助记词，请将它**妥善保管**在一个**绝对安全**的地方
- 助记词是你钱包的 **唯一恢复方式**
- 请**妥善保存**到一个**绝对安全的地方**
	- 不要以明文形式存放在文件中
	- 不要在任何通讯介质中发送助记词
	- 不要分享给任何人
- 可以写在物理介质上并放在安全且不会丢失的地方

创建钱包后，你将获得一个 **EVM 地址**（以 `0x` 开头的 42 位字符串，例如 `0x1234...abcd`）。
- 这个地址就是你在以太坊等 EVM 网络上的身份标识。
- 你可以将它理解为区块链世界里的“银行卡号”。

更多链上安全实践，请参考 [Slowmist Blackbook](https://github.com/slowmist/Blockchain-dark-forest-selfguard-handbook)

## 2 Add Ethereum Sepolia Network
MetaMask 默认只显示主网（Mainnet），我们需要手动添加测试网络。

### 操作步骤
1. 打开 MetaMask，点击右上角菜单，选择网络 networks。
2. 选择 **Add a custom network（添加自定义网络）**。
3. 填入以太坊测试网 Ethereum Sepolia 网络参数：
- Network name: `Ethereum Sepolia`
- New RPC URL: `https://ethereum-sepolia-rpc.publicnode.com`
	- 或者在[这里](https://chainlist.org/chain/11155111)随便选择一个公共 RPC 节点
- Chain ID: `11155111`
- Currency symbol: `ETH`
- Block explorer URL: `https://sepolia.etherscan.io`

保存后，切换到该网络，你就进入了 Sepolia 测试网。

## 3 Get Your Testnet token
接下来我们需要获取一下测试币，别担心，这些都是免费的
- 在 [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) 输入你的钱包地址直接领取
- 或者用 [PoW faucet](https://sepolia-faucet.pk910.de) 体验挖矿的乐趣（虽然挖的只是不值钱的测试币）

## 4 Transfer
现在来完成最后一步 —— 向协会的“特殊地址”转账！

### 目标
- 网络：Ethereum Sepolia
- 收款地址：`0xE2a73c8E3Af6379fa58e477B0e2129f21E023010`
- 金额：`0.0233 ETH`

### 操作步骤
1. 打开 MetaMask，确认已切换到 **Ethereum Sepolia** 网络。
2. 点击 **Send（发送）**。
3. 输入收款地址 `0xE2a73c8E3Af6379fa58e477B0e2129f21E023010` 和金额 `0.0233`。
4. 确认交易
5. 等待交易完成

稍等片刻 MetaMask 会提示交易成功，点击交易详情查看记录。

复制你的 **TxHash（交易ID）** 并提交，任务完成 ✅。
- 例如 [0xd56c31fce45ee1e993228f2854e1f7b2bd36222913a20868152a4c4f2be1ab44](https://sepolia.etherscan.io/tx/0xd56c31fce45ee1e993228f2854e1f7b2bd36222913a20868152a4c4f2be1ab44)

## 🎉 恭喜！  
你已经完成了第一笔链上交易，正式迈进了区块链的世界！接下来，你会逐步学习更多技能：合约交互、DApp 使用、甚至自己部署智能合约。

这是一个全新的旅程，欢迎加入我们 🚀。