import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { NetworkSettings } from "@/components/network-settings";
import { faucets, settings, nftEnabled } from "@/lib/config";

export const metadata: Metadata = {
  title: "入门指南 · PKUBA Get Ready",
  description:
    "从安装 MetaMask、设置 Sepolia、领取测试币，到提交留言和查询交易的完整入门指南。",
};

const chapters = [
  ["wallet", "安装与创建钱包"],
  ["network", "设置 Sepolia 网络"],
  ["faucet", "领取测试币"],
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
      <SiteHeader guide />
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
            这次热身任务是在 <strong>Ethereum Sepolia 测试网</strong>
            上提交一条留言，最后记录<strong>交易哈希</strong>。
          </p>
        </header>
        <div className="guide-layout">
          <nav className="guide-toc" aria-label="指南目录">
            <span>本页内容</span>
            <ol>
              {chapters.map(([id, label], i) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="guide-article" id="guide-content">
            <section id="wallet">
              <div className="chapter-label">01 / WALLET</div>
              <h2>安装 MetaMask，创建钱包</h2>
              <p>
                钱包用来管理你的账户，并在你同意时为交易签名。MetaMask
                是本次任务使用的钱包。本指南使用电脑上的浏览器完成操作。
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
                  ，选择你使用的浏览器。Chrome
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
                  安装完成后，从浏览器右上角的extensions打开
                  MetaMask。可以将它固定在工具栏，方便后续找到。
                </li>
                <li>
                  按照钱包提示创建一个新钱包并设置解锁密码。建议使用独立的测试钱包，不要在里面存放真实资产。
                </li>
                <li>
                  如果创建流程提供了助记词（Secret Recovery
                  Phrase），按提示备份并完成确认。推荐写在纸上，存放在安全、不会丢失的地方。
                </li>
                <li>
                  进入账户页面，找到以 <code>0x</code> 开头的 Ethereum
                  地址。
                </li>
              </ol>
              <p>
                钱包地址是可以公开的账户标识：通常为 <code>0x</code> 加 40
                个十六进制字符，共 42 位。页面上的 <code>0x1234…abcd</code>{" "}
                只是缩写，领取测试币或提交任务时要复制完整地址。
              </p>
              <h3>助记词、私钥和地址有什么区别？</h3>
              <p>
                地址可以告诉别人，用来接收测试币和查询交易。助记词和私钥则能控制账户，不能分享。钱包密码用于解锁本机钱包，也不要交给别人。
              </p>
            </section>

            <section id="network">
              <div className="chapter-label">02 / NETWORK</div>
              <h2>切换到 Ethereum Sepolia</h2>
              <p>
                Sepolia 是用于练习和测试的 Ethereum 网络。它和 Ethereum
                主网的余额、交易记录相互独立。请确认你选择的是{" "}
                <strong>Ethereum Sepolia</strong>，不是 Ethereum Mainnet、Base
                Sepolia 或其他名字相似的网络。
              </p>
              <h3>先尝试显示已有的测试网络</h3>
              <ol>
                <li>
                  打开 MetaMask，在菜单中进入 <strong>Networks</strong>
                  。部分版本可直接点击当前网络名称打开网络列表。
                </li>
                <li>
                  找到并开启 <strong>Show test networks</strong>
                  ，通常位于网络列表底部。
                </li>
                <li>
                  在列表中选择 <strong>Sepolia / Ethereum Sepolia</strong>
                  。如果已有该网络，不需要重复手动添加。
                </li>
              </ol>
              <h3>找不到 Sepolia？手动添加网络</h3>
              <p>
                在网络列表中选择{" "}
                <strong>Add a custom network</strong>
                ，逐项填入下面的信息。
              </p>
              <NetworkSettings />
              <ol>
                <li>
                  复制上面的值，Chain ID 使用十进制的{" "}
                  <code>11155111</code>，不要带空格。
                </li>
                <li>
                  点击 <strong>Save</strong>。如果提示该 Chain ID
                  已存在，返回网络列表，选择现有的 Sepolia。
                </li>
                <li>保存后切换到该网络，再确认钱包显示的是 Sepolia。</li>
              </ol>
              <p>
                RPC URL
                是钱包连接区块链节点的入口，不是收款地址。上面提供的是公共节点；如果连接不稳定，可以在现有
                Sepolia 网络的 Edit（编辑）设置中更换 RPC。
              </p>
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
                。节点由{" "}
                <a
                  href="https://www.publicnode.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  PublicNode ↗
                </a>{" "}
                提供。
              </p>
            </section>

            <section id="faucet">
              <div className="chapter-label">03 / TEST ETH</div>
              <h2>领取Sepolia ETH</h2>
              <p>
                提交留言需要支付 Gas，也就是网络执行交易的手续费。这里使用的是
                Sepolia ETH，<strong>没有真实货币价值，不需要购买</strong>
                。发放测试币的网站通常叫Faucet。
              </p>
              <ol>
                <li>在 MetaMask 中复制你刚才创建的 Ethereum 钱包地址。</li>
                <li>
                  打开{" "}
                  <a href={faucets[0].url} target="_blank" rel="noreferrer">
                    Google Cloud Sepolia Faucet ↗
                  </a>
                  。根据网站提示登录，确认领取网络是 Ethereum Sepolia。
                </li>
                <li>
                  等待发放完成，回到 MetaMask 查看 Sepolia
                  余额。若暂时没有变化，稍后刷新。
                </li>
              </ol>
              <p>
                如果当前Faucet不可用，或你的账户不满足领取条件，可以在{" "}
                <a href={faucets[1].url} target="_blank" rel="noreferrer">
                  Ethereum.org Faucet目录 ↗
                </a>
                查看其他来源。
              </p>

            </section>

            <section id="message">
              <div className="chapter-label">04 / FIRST INTERACTION</div>
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
                  <strong>Ethereum Sepolia</strong>
                  。若显示网络不正确，点击“切换到 Sepolia”并在钱包中确认。
                </li>
                <li>
                  输入一条留言，例如 <code>Hello PKUBA!</code> 或{" "}
                  <code>我想学习DeFi。</code>。也可以写你感兴趣的方向。最多 280
                  字节，中文通常占 3 字节，输入框下方会显示计数。
                </li>
                <li>
                  点击<strong>“写入链上”</strong>
                  。页面先检查内容、网络和预计手续费，然后 MetaMask
                  会显示交易确认窗口。
                </li>
              </ol>
              {settings.address ? (
                <p>
                  本次任务的合约地址：
                  <a
                    className="guide-contract"
                    href={`https://sepolia.etherscan.io/address/${settings.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <code>{settings.address}</code> ↗
                  </a>
                  。钱包确认窗口里的目标地址应与它一致。
                </p>
              ) : (
                <p>
                  交易目标由活动网站自动填写。签名前，请将钱包中的合约地址与公布的地址核对。
                </p>
              )}
              <p>
                留言会以公开的event log保存，无法在本网站撤回。不要写学号、手机号、或其他隐私。即使不填写个人资料，留言也会与钱包地址关联。
              </p>
            </section>

            <section id="receipt">
              <div className="chapter-label">05 / ETHERSCAN</div>
              <h2>查看交易，找到 Tx Hash</h2>
              <p>
                交易哈希（Transaction Hash / Tx
                Hash）是这笔交易的唯一编号，通常是 <code>0x</code> 加 64
                个十六进制字符，共 66
                位。它与钱包地址不同：一个地址可以发送很多笔交易，每笔交易都有自己的哈希。
              </p>
              <ol>
                <li>
                  在成功结果里点击<strong>“在 Etherscan 查看”</strong>，会打开
                  Sepolia 区块浏览器中的这笔交易。
                </li>
                <li>
                  确认 <strong>Status</strong> 为 <strong>Success</strong>
                  。如果还显示 Pending，稍后再刷新。
                </li>
                <li>
                  找到 <strong>Transaction Hash</strong>
                  ，点击旁边的复制按钮复制完整哈希。不要只提交页面上缩写后的前后几位。
                </li>
                <li>
                  <strong>Block</strong>{" "}
                  是交易所在的区块，<strong>Transaction Fee</strong>{" "}
                  是实际支付的手续费。
                </li>
              </ol>
              <p>
                使用 MetaMask 智能账户时，交易可能经过 DelegationManager，
                所以 <strong>To</strong> 不一定是留言合约地址，
                也可能看到 <code>RedeemedDelegation</code>，这是钱包的执行记录。
              </p>
              <p>
                查看留言：打开 <strong>Logs</strong>，找到 <strong>Address</strong>{" "}
                为本次留言contract的logs：
                <a
                  href={`https://sepolia.etherscan.io/address/${settings.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>{settings.address}</code>
                </a>
                在 <strong>Data</strong> 中从第 4 行开始，
                点击左侧 <strong>Hex ▾ → Text</strong> 查看留言。较长的留言会分成多行。
              </p>
            </section>

            <section id="submit">
              {nftEnabled && <p>首次留言成功后，合约会在同一笔交易中向你的钱包发放一枚 Get Ready 纪念 NFT。无需再次签名或手动领取，完成页面会显示图片。提交任务时仍只需交易哈希。</p>}
              <div className="chapter-label">06 / SUBMISSION</div>
              <h2>记录结果，提交任务</h2>
              <p>
                在招新问卷提交这笔交易的完整交易哈希。
              </p>
             
              <p>
                做到这里，这次入门任务就完成了。你已经用钱包签名、调用合约，并在区块浏览器上查到了自己的交易✨
              </p>

            </section>

          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
