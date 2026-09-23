import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function QuestGuide() {
  return (
    <aside className="quest-guide" id="guide">
      <div className="guide-eyebrow">
        GET READY QUEST
      </div>
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
            <h3>发送一笔测试币</h3>
            <p>按入门指南向任务合约发送 0.001 Sepolia ETH，保存转账哈希。</p>
          </div>
        </li>
        <li>
          <span className="step-number">4</span>
          <div>
            <h3>把你的想法写上链</h3>
            <p>输入留言，在钱包中确认交易。等它上链，去 Etherscan 看看！</p>
          </div>
        </li>
      </ol>
    </aside>
  );
}

export function CompletionGuide() {
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
    </div>
  );
}
