import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContractAddress } from "@/components/contract-address";
import { GuideImage } from "@/components/guide-image";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { NetworkSettings } from "@/components/network-settings";
import { faucets, settings, nftEnabled } from "@/lib/config";

export const metadata: Metadata = {
  title: "Guide · PKUBA Get Ready",
  description:
    "从安装 MetaMask、设置 Sepolia、领取测试币，到提交留言和查询交易的完整入门指南。",
};

const chapters = [
  ["before-you-start", "开始前：钱包是什么"],
  ["wallet", "安装与创建钱包"],
  ["network", "设置 Sepolia 网络"],
  ["faucet", "领取测试币"],
  ["transfer", "发送一笔测试币"],
  ["message", "连接并提交留言"],
  ["receipt", "查看交易结果"],
  ["submit", "提交任务"],
];

export default function GuidePage() {
  return (
    <>
      <a className="skip-link" href="#guide-content">
        跳转到指南正文
      </a>
      <SiteHeader guide locale="zh" />
      <main className="guide-page">
        <header className="guide-heading">
          <Link className="guide-back" href="/">
            <ArrowLeft size={14} /> 返回任务页面
          </Link>
          <p className="guide-edition">
            PKUBA TECH · 2026 FALL GET READY QUEST
          </p>
          <h1>入门指南</h1>
          <p>
            欢迎加入<strong>北大链协技术部!🎉</strong>
          </p>
          <p>
            这次热身任务是在 <strong>以太坊 Sepolia 测试网（Ethereum Sepolia Testnet）</strong>
            上完成一笔<strong>测试币（Testnet ETH）</strong>转账，再提交一条留言，最后记录
            <strong>交易哈希（Transaction Hash）</strong>。对很多同学来说，这是在
            <strong>区块链（Blockchain）</strong>上留下的第一条痕迹~
            测试币没有真实货币价值，不需要购买，之后会教大家如何免费领取。
          </p>
          <p>
            如果你已经有链上交互经验，这项任务应该很快就能完成。如果是第一次尝试，也不用担心，跟着下面的步骤，从创建钱包开始，一步步完成你的第一笔链上交易吧！
          </p>
        </header>
        <div className="guide-layout">
          <nav className="guide-toc" aria-label="指南目录">
            <span>本页内容</span>
            <ol>
              {chapters.map(([id, label], i) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <span>{String(i).padStart(2, "0")}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="guide-article" id="guide-content">
            <section id="before-you-start">
              <div className="chapter-label">00 / BEFORE YOU START</div>
              <h2>先弄懂：钱包是什么，为什么需要它？</h2>
              <p>
                <strong>区块链</strong>是一个去中心化的网络，没有传统网站的“用户名 + 密码”账户中心。你想接收测试币、发送交易或在
                <strong>智能合约（Smart Contract）</strong>里留言，需要先有一个属于自己的
                <strong>链上账户（Onchain Account）</strong>。<strong>钱包（Wallet）</strong>就是帮助你创建和使用这个账户的工具。
              </p>
              <p>以下是钱包的三个主要作用：</p>
              <div className="wallet-explainer" aria-label="钱包的三个作用">
                <div>
                  <span>01</span>
                  <h3>显示账户</h3>
                  <p>查看你的地址、各网络上的余额和交易记录。</p>
                </div>
                <div>
                  <span>02</span>
                  <h3>保管控制权</h3>
                  <p>在本机管理<strong>私钥（Private Key）</strong>。谁掌握私钥，谁就能控制这个账户。</p>
                </div>
                <div>
                  <span>03</span>
                  <h3>为操作签名</h3>
                  <p>发送资产或调用合约前，由你在钱包里确认并完成<strong>签名（Signature）</strong>。</p>
                </div>
              </div>
              <h3>钱包里真的“装着币”吗？</h3>
              <p>
                严格来说没有。余额和交易记录保存在区块链网络上；钱包保存的是证明“这个账户由你控制”所需的密钥，并帮你读取链上数据。可以把区块链想成一本所有人共同维护的公开账本，把钱包想成你的<strong>钥匙串和签字笔</strong>。
              </p>
              <div className="concept-table" role="group" aria-label="钱包常见概念对照">
                <dl>
                  <div>
                    <dt><strong>钱包地址（Wallet Address）</strong></dt>
                    <dd>像收款账号。可以公开给别人，用来收币或查询记录。</dd>
                  </div>
                  <div>
                    <dt><strong>私钥</strong></dt>
                    <dd>像不可更换的最高权限签名。绝不能发送、截图或粘贴给别人。</dd>
                  </div>
                  <div>
                    <dt><strong>助记词（Secret Recovery Phrase）</strong></dt>
                    <dd>通常能恢复整个钱包，比普通密码更重要。丢失后平台无法帮你找回。</dd>
                  </div>
                  <div>
                    <dt><strong>钱包密码（Wallet Password）</strong></dt>
                    <dd>只用于解锁当前设备上的钱包，不能替代助记词恢复钱包。</dd>
                  </div>
                </dl>
              </div>
              <div className="guide-callout guide-callout-danger">
                <strong>记住这一句：</strong>地址可以给别人，助记词和私钥永远不能给任何人。
                客服、老师、同学和本网站都不需要知道它们。
              </div>
              <h3>为什么本任务建议新建测试钱包？</h3>
              <p>
                它能把练习与真实资产隔离。即使误连了不熟悉的网站，风险也只局限在这个没有真实资产的练习账户。完成本任务只需要 MetaMask 浏览器扩展、一个新测试钱包和少量免费的 Sepolia 测试币。
              </p>
              <p className="step-result">读完本节，你应该知道：钱包用来管理密钥和签名，地址可公开，助记词与私钥必须保密。</p>
            </section>

            <section id="wallet">
              <div className="chapter-label">01 / WALLET</div>
              <h2>安装 MetaMask，创建钱包</h2>
              <p>
                <strong>MetaMask</strong> 是常用的以太坊钱包。本指南使用电脑浏览器完成操作；请只从官网或浏览器官方扩展商店安装，避免搜索广告里的仿冒插件。
              </p>
              <ol>
                <li>
                  打开{" "}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MetaMask 官方下载页 ↗
                  </a>
                  ，默认下载“浏览器扩展”，选择你使用的浏览器。Chrome
                  用户也可以使用
                  <a
                    href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    官方商店链接 ↗
                  </a>
                  。
                </li>
                <li>
                  安装完成后，会弹出一个页面，先不用管。从浏览器右上角的“扩展程序”打开
                  MetaMask。可以将它固定在工具栏，方便后续找到。
                  <GuideImage
                    filename="固定工具栏.png"
                    alt="从浏览器扩展程序菜单打开 MetaMask"
                  />
                </li>
                <li>
                  选择<strong>“创建新钱包”</strong>，按照提示创建新钱包并设置解锁密码。
                </li>
                <li>
                  钱包会显示助记词。确认周围无人、没有录屏或共享屏幕后，按顺序抄写在纸上并完成验证。不要截图、上传网盘或发到聊天软件。助记词是进入钱包的唯一钥匙，任何其他人拿到助记词就可以进入钱包。
                </li>
                <li>
                  进入账户页面，找到以 <code>0x</code> 开头的以太坊
                  地址。
                  <GuideImage
                    filename="以太坊地址.png"
                    alt="在 MetaMask 中查看以 0x 开头的以太坊地址"
                  />
                </li>
              </ol>
              <p>
                钱包地址是可以公开的账户标识：通常为 <code>0x</code> 加 40
                个十六进制字符，共 42 位。页面上的 <code>0x1234…abcd</code>{" "}
                只是缩写，领取测试币或提交任务时要复制完整地址。
              </p>
              <h3>助记词、私钥和地址有什么区别？</h3>
              <p>
                地址可以告诉别人，用来接收测试币和查询交易。助记词和私钥则能控制账户，不能分享。钱包密码用于解锁本机钱包。
              </p>
              <div className="guide-checkpoint">
                <strong>完成标志</strong>
                <ul>
                  <li>浏览器工具栏中能打开 MetaMask；</li>
                  <li>你能看到并复制一个以 <code>0x</code> 开头的完整地址；</li>
                  <li>助记词已离线保存，没有发送给任何人。</li>
                </ul>
              </div>
            </section>

            <section id="network">
              <div className="chapter-label">02 / NETWORK</div>
              <h2>切换到 Sepolia 测试网</h2>
              <p>
                Sepolia 是用于练习和测试的以太坊网络。它和<strong>以太坊主网（Ethereum Mainnet）</strong>
                的余额、交易记录相互独立。请确认你选择的是 Sepolia，不是主网、Base Sepolia 或其他名字相似的网络。
              </p>
              <h3>先尝试显示已有的测试网络</h3>
              <ol>
                <li>
                  打开 MetaMask，在菜单中点击<strong>“所有网络”</strong>
                  。
                </li>
                <li>
                  点击“管理网络”，找到并开启<strong>“显示测试网络”</strong>。此时可以看到“Sepolia”等测试网。
                  <GuideImage
                    filename="测试网.png"
                    alt="在 MetaMask 中开启显示测试网络"
                  />
                </li>
                <li>
                  左上角点击返回，再次点击“所有默认网络”，在测试网列表中选择 <strong>Sepolia</strong>。
                </li>
              </ol>
              <h3>找不到 Sepolia？手动添加网络</h3>
              <p>
                在网络列表中选择{" "}
                <strong>“添加自定义网络”</strong>
                ，逐项填入下面的信息。
              </p>
              <NetworkSettings locale="zh" />
              <ol>
                <li>
                  复制上面的值，<strong>链 ID</strong> 使用十进制的{" "}
                  <code>11155111</code>，不要带空格。
                </li>
                <li>
                  点击<strong>“保存”</strong>。如果提示该链 ID
                  已存在，返回网络列表，选择现有的 Sepolia。
                </li>
                <li>保存后切换到该网络，再确认钱包显示的是 Sepolia。</li>
              </ol>
              <p>
                <strong>RPC 地址</strong>
                是钱包连接区块链节点的入口，不是收款地址。上面提供的是公共节点；如果连接不稳定，可以在现有
                Sepolia 网络的“编辑”设置中更换 RPC 地址。
              </p>
              <div className="guide-checkpoint">
                <strong>完成标志</strong>
                <p>MetaMask 顶部网络名称显示 <strong>网络：: Sepolia</strong>，表示切换成功。</p>
              </div>
              <p className="guide-reference">
                界面位置可对照{" "}
                <a
                  href="https://support.metamask.io/configure/networks/how-to-view-testnets-in-metamask/"
                  target="_blank"
                  rel="noreferrer"
                >
                  MetaMask 显示测试网络说明 ↗
                </a>
                、
                <a
                  href="https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/"
                  target="_blank"
                  rel="noreferrer"
                >
                  手动添加与修改 RPC 说明 ↗
                </a>
              </p>
            </section>

            <section id="faucet">
              <div className="chapter-label">03 / TEST ETH</div>
              <h2>领取 Sepolia 测试币</h2>
              <p>
                提交留言需要支付<strong>手续费（Gas）</strong>，也就是网络执行交易的费用。这里使用的是
                Sepolia 测试币，没有真实货币价值，不需要购买。发放测试币的网站通常叫
                <strong>水龙头（Faucet）</strong>。
              </p>
              <ol>
                <li>在 MetaMask 中复制你刚才创建的以太坊钱包地址。</li>
                <li>
                  打开{" "}
                  <a href={faucets[0].url} target="_blank" rel="noreferrer">
                    Google Cloud Sepolia Faucet ↗
                  </a>
                  。根据网站提示领取，确认领取网络是 Ethereum Sepolia。
                </li>
                <li>
                  等待发放完成，回到 MetaMask 查看 SepoliaETH
                  余额。
                </li>
              </ol>
              <p>
                如果当前水龙头不可用，或你的账户不满足领取条件，可以在{" "}
                <a href={faucets[1].url} target="_blank" rel="noreferrer">
                  Ethereum.org Faucet目录 ↗
                </a>
                查看其他来源。
              </p>
              <p>
                或者用{" "}
                <a href="https://sepolia-faucet.pk910.de" target="_blank" rel="noreferrer">
                  PoW faucet ↗
                </a>
                体验挖矿的乐趣（虽然挖的只是不值钱的测试币）
              </p>
              <div className="guide-callout">
                <strong>不要付费购买测试币。</strong> 水龙头只需要你的公开地址，绝不会需要助记词或私钥。余额暂时没出现时，先确认钱包仍在 Sepolia 网络，再等待几分钟刷新。
              </div>

            </section>

            <section id="transfer">
              <div className="chapter-label">04 / TRANSFER</div>
              <h2>向任务合约发送测试币</h2>
              <p>使用刚才领取测试币的账户，在 MetaMask 中完成这一步。</p>
              {settings.address && (
                <ContractAddress address={settings.address} label="收款地址" locale="zh" />
              )}
              <p>
                这是协会部署在 Sepolia 测试网上的一个<strong>“特殊地址”</strong>，也就是智能合约地址。
                它不是某个人的钱包，而是用来接收本次任务转账并记录交互。
              </p>
              <ol>
                <li>确认网络为 <strong>Sepolia</strong>，点击<strong>“发送”</strong>，粘贴上面的完整合约地址。</li>
                <li>选择 ETH，填写 <strong>0.001 ETH</strong>。留一些 Sepolia 测试币，用于这笔转账和后续留言的手续费。</li>
                <li>核对网络、收款地址和金额，确认发送。</li>
                <li>等待交易成功，在交易详情中打开 Etherscan，保存这笔转账的完整交易哈希，然后继续下面的留言步骤。</li>
              </ol>
              <div className="guide-checkpoint">
                <strong>签名前再核对一次</strong>
                <p>网络是 Sepolia；收款地址与本页完全一致；金额是 0.001 ETH；钱包仍留有支付手续费的余额。</p>
              </div>
            </section>

            <section id="message">
              <div className="chapter-label">05 / FIRST INTERACTION</div>
              <h2>连接钱包，提交一条留言</h2>
              <p>
                回到
                <Link href="/" target="_blank" rel="noreferrer">
                  任务页面 ↗
                </Link>
                。这一步直接在活动网站完成。
              </p>
              <ol>
                <li>
                  点击<strong>“连接钱包”</strong>。MetaMask
                  弹出请求后，核对网站域名，选择本次使用的测试账户，再确认连接。
                </li>
                <li>
                  确认页面上的钱包地址与你领取测试币的地址一致，网络显示为{" "}
                  <strong>Sepolia</strong>
                  。若显示网络不正确，点击“切换到 Sepolia”并在钱包中确认。
                </li>
                <li>
                  输入一条留言，例如 <strong><code>Hello PKUBA!</code></strong> 或{" "}
                  <strong><code>我想学习DeFi</code></strong>, 也可以写你感兴趣的方向。最多 280
                  字节，中文通常占 3 字节，输入框下方会显示计数。
                </li>
                <li>
                  点击<strong>“写入链上”</strong>
                  。页面先检查内容、网络和预计手续费，然后 MetaMask
                  会显示交易确认窗口。
                </li>
              </ol>
              {settings.address ? (
                <ContractAddress
                  address={settings.address}
                  label="本次任务的合约地址"
                  locale="zh"
                />
              ) : (
                <p>
                  交易目标由活动网站自动填写。签名前，请将钱包中的合约地址与公布的地址核对。
                </p>
              )}
              <p>
                留言会以公开的<strong>事件日志（Event Log）</strong>保存，无法在本网站撤回。不要写姓名、学号或其他隐私。
              </p>
              <div className="guide-callout">
                <strong>“连接钱包”不等于转账。</strong> 连接只允许网站读取你的公开地址；真正写入链上时，MetaMask 会另行弹窗，请逐项核对后再确认。
              </div>
            </section>

            <section id="receipt">
              <div className="chapter-label">06 / ETHERSCAN</div>
              <h2>查看交易和留言</h2>
              <p>
                <strong>区块链浏览器（Block Explorer）</strong>是用来查询链上公开数据的网站，有点像区块链的“搜索引擎”。
                你可以输入钱包地址、交易哈希或合约地址，查看余额、交易状态、发生时间和手续费等信息。
                <strong>Etherscan</strong> 是以太坊生态中常用的区块链浏览器，可以查看以太坊主网和 Sepolia 等测试网的数据。
                它只能读取公开的链上记录，不是钱包，也不会保管你的资产；浏览时不需要连接钱包，更不会发起交易。
              </p>
              <p>
                交易哈希是这笔交易的唯一编号，通常是 <code>0x</code> 加 64
                个十六进制字符，共 66
                位。它与钱包地址不同：一个地址可以发送很多笔交易，每笔交易都有自己的哈希。
              </p>
              <ol>
                <li>
                  在成功结果里点击<strong>“在 Etherscan 上查看”</strong>，会打开
                  Sepolia 区块浏览器中的这笔交易。
                </li>
                <li>
                  找到<strong>交易哈希</strong>，点击旁边的复制按钮复制完整内容。
                </li>
                <li>
                  <strong>区块（Block）</strong>是交易被记录的位置，
                  <strong>交易手续费（Transaction Fee）</strong>是实际支付的费用。
                </li>
              </ol>
              <h3>在<strong>日志（Logs）</strong>中读到自己的留言</h3>
              <p>
                <strong>智能合约</strong>已在 Etherscan 完成源码验证，留言会直接显示为文字，中文也可以正常阅读。
              </p>
              <ol>
                <li>
                  在交易页面点击日志标签，找到名为{" "}
                  <strong>MessageLeft</strong> 的事件。
                </li>
                <li>
                  确认这条事件的 <strong>Address</strong> 是下方的本次任务合约地址。
                </li>
                <li>
                  查看 <strong>sender</strong>，这是发表留言的钱包地址；
                  <strong>content</strong> 就是你写下的留言。
                  <strong>timestamp</strong> 是留言所在区块的时间戳。
                </li>
              </ol>
              {settings.address && (
                <ContractAddress
                  address={settings.address}
                  label="本次任务合约地址"
                  locale="zh"
                />
              )}
              {nftEnabled && (
                <p>
                  首次留言成功后，合约会在同一笔交易中向你的钱包发放一枚 Get Ready
                  纪念<strong>非同质化代币（NFT）</strong>。无需再次签名或手动领取，可以在 MetaMask 的 NFT 页面中查看。
                </p>
              )}
            </section>

            <section id="submit">
              <div className="chapter-label">07 / SUBMISSION</div>
              <h2>提交任务</h2>
              <p>
                在招新问卷里分别提交转账和留言的完整交易哈希。
              </p>
              <div className="guide-callout">
                <h3>🎉 恭喜！</h3>
                <p>
                  你已经完成了第一笔链上交易，正式迈进了区块链的世界！接下来，你会逐步学习更多技能：合约交互、DApp 使用，甚至自己部署智能合约。
                </p>
                <p>这是一个全新的旅程，欢迎加入我们 🚀</p>
              </div>

            </section>

          </article>
        </div>
      </main>
      <SiteFooter locale="zh" />
    </>
  );
}
