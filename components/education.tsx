import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function QuestGuide({ locale = "zh" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <aside className="quest-guide" id="guide">
      <div className="guide-eyebrow">
        GET READY QUEST
      </div>
      <h2>{en ? <>New to blockchain?<br />Start with a wallet</> : <>第一次接触区块链？<br />先从钱包开始</>}</h2>
      <p className="guide-intro">
        {en ? <><strong>A wallet</strong> is not a pocket that stores cryptocurrency. It is the tool you use to manage an <strong>onchain account</strong>, approve actions, and sign transactions. This quest uses <strong>testnet ETH</strong> with no real-world value, so you can learn safely.</> : <><strong>钱包（Wallet）</strong>不是装数字货币的口袋，而是你管理<strong>链上账户（Onchain Account）</strong>、确认操作和签名交易的工具。本任务全程使用没有真实价值的<strong>测试币（Testnet ETH）</strong>，可以放心练习。</>}
      </p>
      <Link
        className="full-guide-link"
        href={en ? "/en/guide" : "/guide"}
        target="_blank"
        rel="noreferrer"
      >
        {en ? "Read the complete beginner guide" : "从零开始阅读完整指南"} <ArrowRight size={14} />
      </Link>
      <ol className="steps">
        <li>
          <span className="step-number">1</span>
          <div>
            <h3>{en ? "Understand and create a test wallet" : "理解并创建测试钱包"}</h3>
            <p>{en ? "Learn about addresses, private keys, and recovery phrases, then install MetaMask. We recommend a new wallet used only for practice." : "先认识地址、私钥和助记词，再安装 MetaMask。推荐新建一个只用于练习的钱包。"}</p>
          </div>
        </li>
        <li>
          <span className="step-number">2</span>
          <div>
            <h3>{en ? "Get some test ETH" : "领取一点测试币"}</h3>
            <p>{en ? <>Switch to the <strong>Sepolia testnet</strong> and get free test ETH from a faucet.</> : <>切换到 <strong>Sepolia 测试网</strong>，从水龙头免费领取测试币。</>}</p>
          </div>
        </li>
        <li>
          <span className="step-number">3</span>
          <div>
            <h3>{en ? "Send a test transaction" : "发送一笔测试币"}</h3>
            <p>{en ? <>Check the network, recipient, and amount; send <strong>0.001 ETH</strong> and save the <strong>transaction hash</strong>.</> : <>核对网络、收款地址和金额，发送 <strong>0.001 ETH</strong>，并保存<strong>交易哈希（Transaction Hash）</strong>。</>}</p>
          </div>
        </li>
        <li>
          <span className="step-number">4</span>
          <div>
            <h3>{en ? "Put your message onchain" : "把你的想法写上链"}</h3>
            <p>{en ? "Write a message, confirm the transaction in your wallet, and inspect it in a block explorer once it is onchain." : "输入留言，在钱包中确认交易。等它上链，去区块链浏览器看看！"}</p>
          </div>
        </li>
      </ol>
      <div className={`safety-note ${en ? "safety-note-en" : ""}`}>
        <div>
          <strong>{en ? "The most important safety rule" : "最重要的安全规则"}</strong>
          <p>
            {en ? (
              <>
                If <span className="safety-emphasis">anyone</span> asks for your
                recovery phrase or private key,{" "}
                <span className="safety-emphasis">never give it to them</span>.
                This quest will never ask for either.
              </>
            ) : (
              <>
                <span className="safety-emphasis">任何人</span>
                索要助记词或私钥，
                <span className="safety-emphasis">都不要提供</span>
                ；本任务也永远不会向你索取它们。
              </>
            )}
          </p>
        </div>
      </div>
    </aside>
  );
}

export function CompletionGuide({ locale = "zh" }: { locale?: Locale }) {
  const en = locale === "en";
  const steps = en
    ? ["You", "MetaMask", "Transaction", "PKUBA smart contract", "Ethereum Sepolia"]
    : ["你", "MetaMask", "交易", "PKUBA 智能合约", "Ethereum Sepolia"];
  return (
    <div className="completion-guide">
      <h3>{en ? "What just happened?" : "刚才发生了什么？"}</h3>
      <div className="flow">
        {steps.map(
          (step, index) => (
            <span key={step}>
              {index > 0 && <ArrowRight size={12} />}
              {step}
            </span>
          ),
        )}
      </div>
      <p>{en ? "You signed an instruction with your wallet. The network executed the contract, which emitted a MessageLeft event. That public log is the record of your message." : "你用钱包签名了一条指令。网络执行合约，合约发出 MessageLeft 事件，这条公开日志就是你的留言记录。"}</p>
    </div>
  );
}
