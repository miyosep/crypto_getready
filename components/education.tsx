import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { transactionUrl } from "@/lib/contract";

export function QuestGuide() {
  return (
    <aside className="quest-guide" id="guide">
      <div className="guide-eyebrow">
        GET READY QUEST <span>01</span>
      </div>
      <p className="guide-intro">
        准备好 MetaMask 和少量 Sepolia
        ETH，就可以提交留言了。完成后，记得保存交易哈希。
      </p>
      <Link
        className="full-guide-link"
        href="/guide"
        target="_blank"
        rel="noreferrer"
      >
        第一次使用？查看完整入门指南 <ArrowRight size={14} />
      </Link>
      <ol className="steps">
        <li>
          <span className="step-number">1</span>
          <div>
            <h3>准备一个测试钱包</h3>
            <p>安装 MetaMask，推荐创建一个独立的钱包用于本次任务。</p>
          </div>
        </li>
        <li>
          <span className="step-number">2</span>
          <div>
            <h3>领取一点测试币</h3>
            <p>领取 Sepolia ETH。</p>
          </div>
        </li>
        <li>
          <span className="step-number">3</span>
          <div>
            <h3>把你的想法写上链</h3>
            <p>输入留言，在钱包中确认交易。等它上链，去 Etherscan 看看！</p>
          </div>
        </li>
      </ol>
    </aside>
  );
}

export function CompletionGuide({ hash }: { hash: string }) {
  return (
    <div className="completion-guide">
      <h3>刚才发生了什么？</h3>
      <div className="flow">
        {["你", "MetaMask", "交易", "PKUBA 智能合约", "Ethereum Sepolia"].map(
          (step, index) => (
            <span key={step}>
              {index > 0 && <ArrowRight size={12} />}
              {step}
            </span>
          ),
        )}
      </div>
      <p>
        你用钱包签名了一条指令。网络执行合约，合约发出 MessageLeft
        事件，这条公开日志就是你的留言记录。
      </p>
      <details>
        <summary>加分探索：读懂你的交易</summary>
        <p>
          打开{" "}
          <a href={transactionUrl(hash)} target="_blank" rel="noreferrer">
            Sepolia Etherscan <ExternalLink size={12} />
          </a>
          ，找到下面的信息。不需要提交额外答案。
        </p>
        <ul>
          <li>From：是不是你的钱包地址？</li>
          <li>To：是不是 PKUBA 留言合约？</li>
          <li>Transaction Hash 与 Block Number：交易编号和所在区块。</li>
          <li>Gas Fee：执行这笔交易花了多少测试币？</li>
          <li>Input Data：你调用了什么函数？</li>
          <li>Logs：找到 MessageLeft，看看留言内容。</li>
        </ul>
      </details>
    </div>
  );
}
