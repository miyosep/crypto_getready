import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContractAddress } from "@/components/contract-address";
import { GuideImage } from "@/components/guide-image";
import { NetworkSettings } from "@/components/network-settings";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { faucets, nftEnabled, settings } from "@/lib/config";

export const metadata: Metadata = {
  title: "Beginner Guide · PKUBA Get Ready",
  description:
    "A complete beginner guide to installing MetaMask, setting up Sepolia, getting test ETH, leaving a message, and checking the transaction.",
};

const chapters = [
  ["before-you-start", "Before you start: What is a wallet?"],
  ["wallet", "Install and create a wallet"],
  ["network", "Set up Sepolia"],
  ["faucet", "Get test ETH"],
  ["transfer", "Send test ETH"],
  ["message", "Connect and leave a message"],
  ["receipt", "View the transaction"],
  ["submit", "Submit the quest"],
];

export default function EnglishGuidePage() {
  return (
    <>
      <a className="skip-link" href="#guide-content">
        Skip to the guide
      </a>
      <SiteHeader guide locale="en" />
      <main className="guide-page">
        <header className="guide-heading">
          <Link className="guide-back" href="/en">
            <ArrowLeft size={14} /> Back to the quest
          </Link>
          <p className="guide-edition">PKUBA TECH · 2026 FALL GET READY QUEST</p>
          <h1>Beginner Guide</h1>
          <p>
            Welcome to the <strong>PKUBA Tech Department! 🎉</strong>
          </p>
          <p>
            In this warm-up quest, you will make a transfer on the <strong>Ethereum Sepolia testnet</strong>, submit an onchain message, and save the <strong>transaction hashes</strong>. For many students, this will be their first trace on a <strong>blockchain</strong>. Test ETH has no real-world monetary value and can be obtained for free.
          </p>
          <p>
            If you already have onchain experience, this should be quick. If this is your first time, follow the steps below from creating a wallet through completing your first transaction.
          </p>
          <p>
            Today, AI can be one of your best teachers. If you run into any questions or unfamiliar concepts while completing the quest, feel free to ask an AI directly. Using AI will likely become as commonplace as using a smartphone. If you still need help, you are always welcome to ask in the WeChat group—no question is too small.
          </p>
        </header>

        <div className="guide-layout">
          <nav className="guide-toc" aria-label="Guide contents">
            <span>On this page</span>
            <ol>
              {chapters.map(([id, label], index) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <span>{String(index).padStart(2, "0")}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="guide-article" id="guide-content">
            <section id="before-you-start">
              <div className="chapter-label">00 / BEFORE YOU START</div>
              <h2>What is a wallet, and why do you need one?</h2>
              <p>
                A <strong>blockchain</strong> is a decentralized network without the “username + password” account center used by traditional websites. To receive test ETH, send transactions, or leave a message in a <strong>smart contract</strong>, you first need an <strong>onchain account</strong>. A <strong>wallet</strong> is the tool that helps you create and use that account.
              </p>
              <p>A wallet has three main jobs:</p>
              <div className="wallet-explainer" aria-label="The three main jobs of a wallet">
                <div>
                  <span>01</span>
                  <h3>Show your account</h3>
                  <p>View your address, balances on different networks, and transaction history.</p>
                </div>
                <div>
                  <span>02</span>
                  <h3>Protect control</h3>
                  <p>Manage the <strong>private key</strong> on your device. Whoever has the private key controls the account.</p>
                </div>
                <div>
                  <span>03</span>
                  <h3>Sign actions</h3>
                  <p>Review and provide a <strong>signature</strong> before sending assets or calling a contract.</p>
                </div>
              </div>
              <h3>Does a wallet actually contain your coins?</h3>
              <p>
                Not literally. Balances and transaction records live on the blockchain. Your wallet stores the keys that prove you control the account and helps you read blockchain data. Think of the blockchain as a public ledger maintained by everyone, and your wallet as your <strong>keychain and signing pen</strong>.
              </p>
              <div className="concept-table" role="group" aria-label="Common wallet concepts">
                <dl>
                  <div>
                    <dt><strong>Wallet address</strong></dt>
                    <dd>Like an account number. You can share it to receive funds or let someone look up public records.</dd>
                  </div>
                  <div>
                    <dt><strong>Private key</strong></dt>
                    <dd>Like an irreplaceable, highest-authority signature. Never send it, screenshot it, or paste it for anyone.</dd>
                  </div>
                  <div>
                    <dt><strong>Secret recovery phrase</strong></dt>
                    <dd>Usually restores the entire wallet and is more important than an ordinary password. No platform can recover it for you.</dd>
                  </div>
                  <div>
                    <dt><strong>Wallet password</strong></dt>
                    <dd>Unlocks the wallet on the current device only. It cannot replace the recovery phrase.</dd>
                  </div>
                </dl>
              </div>
              <div className="guide-callout guide-callout-danger">
                <strong>Remember this:</strong> your address can be shared, but your recovery phrase and private key must never be shared. Support staff, teachers, classmates, and this website will never need them.
              </div>
              <p className="step-result">After this section, you should understand that a wallet manages keys and signatures, an address is public, and recovery phrases and private keys must remain secret.</p>
            </section>

            <section id="wallet">
              <div className="chapter-label">01 / WALLET</div>
              <h2>Install MetaMask and create a wallet</h2>
              <p>
                <strong>MetaMask</strong> is a widely used Ethereum wallet. This guide uses its desktop browser extension. Install it only from the official website or your browser’s official extension store; avoid imitation extensions in search ads.
              </p>
              <ol>
                <li>
                  Open the <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">official MetaMask download page ↗</a> and choose your browser. Chrome users can also use the <a href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank" rel="noreferrer">official Chrome Web Store listing ↗</a>.
                </li>
                <li>
                  After installation, open MetaMask from the extensions menu in the upper-right corner of your browser. Pin it to the toolbar so it is easy to find later.
                  <GuideImage filename="固定工具栏.png" alt="Open MetaMask from the browser extensions menu" />
                </li>
                <li>Select <strong>“Create a new wallet”</strong>, follow the prompts, and set a password that unlocks the extension on this device.</li>
                <li>
                  MetaMask will show a secret recovery phrase. Make sure nobody can see your screen and that you are not recording or sharing it. Write the words on paper in order and complete the verification. Do not take a screenshot, upload it, or send it in a chat. Anyone with this phrase can enter the wallet and perform transfers or any other action.
                </li>
                <li>
                  Open the account page and find the Ethereum address beginning with <code>0x</code>.
                  <GuideImage filename="以太坊地址.png" alt="Find an Ethereum address beginning with 0x in MetaMask" />
                </li>
              </ol>
              <p>
                A wallet address is a public account identifier, normally <code>0x</code> followed by 40 hexadecimal characters, for 42 characters total. A display such as <code>0x1234…abcd</code> is only an abbreviation; copy the complete address when getting test ETH or submitting the quest.
              </p>
              <h3>What is the difference between the address, private key, and recovery phrase?</h3>
              <p>Your address can be shared to receive test ETH and look up transactions. The recovery phrase and private key control the account and must never be shared. The wallet password only unlocks the wallet on your current device.</p>
              <div className="guide-checkpoint">
                <strong>Checkpoint</strong>
                <ul>
                  <li>You can open MetaMask from the browser toolbar.</li>
                  <li>You can view and copy a complete address beginning with <code>0x</code>.</li>
                  <li>Your recovery phrase is stored offline and has not been shared.</li>
                </ul>
              </div>
            </section>

            <section id="network">
              <div className="chapter-label">02 / NETWORK</div>
              <h2>Switch to the Sepolia testnet</h2>
              <p>
                Sepolia is an Ethereum network for practice and testing. Its balances and transactions are separate from <strong>Ethereum Mainnet</strong>. Make sure you choose Sepolia—not Mainnet, Base Sepolia, or another similarly named network.
              </p>
              <h3>First, show the built-in test networks</h3>
              <ol>
                <li>Open MetaMask and select <strong>“All networks”</strong> from the menu.</li>
                <li>
                  Select “Manage networks” and enable <strong>“Show test networks”</strong>. Test networks including Sepolia will appear.
                  <GuideImage filename="测试网.png" alt="Enable test networks in MetaMask" />
                </li>
                <li>Go back, open the networks list again, and choose <strong>Sepolia</strong> from the test networks.</li>
              </ol>
              <h3>Cannot find Sepolia? Add it manually</h3>
              <p>Select <strong>“Add a custom network”</strong> and enter the following values.</p>
              <NetworkSettings locale="en" />
              <ol>
                <li>Copy the values above. Use decimal <code>11155111</code> for the <strong>chain ID</strong>, with no spaces.</li>
                <li>Select <strong>“Save”</strong>. If MetaMask says the chain ID already exists, return to the network list and select the existing Sepolia entry.</li>
                <li>Switch to the saved network and confirm that MetaMask displays Sepolia.</li>
              </ol>
              <p>
                The <strong>RPC URL</strong> is the endpoint your wallet uses to connect to a blockchain node; it is not a recipient address. The value above is a public endpoint. If it is unstable, replace it in the existing Sepolia network settings.
              </p>
              <div className="guide-checkpoint">
                <strong>Checkpoint</strong>
                <p>MetaMask shows <strong>Network: Sepolia</strong> at the top.</p>
              </div>
              <p className="guide-reference">
                For the exact interface locations, see MetaMask’s guides to <a href="https://support.metamask.io/configure/networks/how-to-view-testnets-in-metamask/" target="_blank" rel="noreferrer">showing test networks ↗</a> and <a href="https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/" target="_blank" rel="noreferrer">adding or editing a custom RPC network ↗</a>.
              </p>
            </section>

            <section id="faucet">
              <div className="chapter-label">03 / TEST ETH</div>
              <h2>Get Sepolia test ETH</h2>
              <p>
                Submitting a message requires a <strong>gas fee</strong>, which pays for the network to execute a transaction. Sepolia ETH has no real-world monetary value and does not need to be purchased. Websites that distribute test ETH are called <strong>faucets</strong>.
              </p>
              <ol>
                <li>Copy the Ethereum wallet address you just created in MetaMask.</li>
                <li>Open the <a href={faucets[0].url} target="_blank" rel="noreferrer">Google Cloud Sepolia Faucet ↗</a>, follow its instructions, and confirm the selected network is Ethereum Sepolia.</li>
                <li>Wait for distribution to finish, then return to MetaMask and check your Sepolia ETH balance.</li>
              </ol>
              <p>If that faucet is unavailable or your account is ineligible, use the <a href={faucets[1].url} target="_blank" rel="noreferrer">Ethereum.org faucet directory ↗</a> to find alternatives.</p>
              <p>If you are curious, you can also try the <a href="https://sepolia-faucet.pk910.de" target="_blank" rel="noreferrer">PoW faucet ↗</a> and experience the fun of mining—even though you will only be mining valueless test ETH.</p>
              <div className="guide-callout">
                <strong>Never pay for test ETH.</strong> A faucet needs only your public address—not your recovery phrase or private key. If the balance does not appear immediately, confirm that MetaMask is still on Sepolia, wait a few minutes, and refresh.
              </div>
            </section>

            <section id="transfer">
              <div className="chapter-label">04 / TRANSFER</div>
              <h2>Send test ETH to the quest contract</h2>
              <p>Complete this step in MetaMask with the account that received your test ETH.</p>
              {settings.address && <ContractAddress address={settings.address} label="Recipient address" locale="en" />}
              <p>
                This is a <strong>“special address”</strong> deployed by the association on Sepolia—a smart contract address. It is not anyone’s personal wallet; it receives the quest transfer and records the interaction.
              </p>
              <ol>
                <li>Confirm the network is <strong>Sepolia</strong>, select <strong>“Send”</strong>, and paste the complete contract address above.</li>
                <li>Select <strong>SepoliaETH</strong> and enter <strong>0.001 ETH</strong>. Keep some Sepolia test ETH for this transfer’s fee and the later message transaction.</li>
                <li>Check the network, recipient address, and amount, then confirm the transfer.</li>
                <li>Wait for success and open the transaction in Etherscan. If it is unreachable, use the Blockscout backup. Save the complete transaction hash before continuing.</li>
              </ol>
              <div className="guide-checkpoint">
                <strong>Check once more before signing</strong>
                <p>The network is Sepolia; the recipient exactly matches this page; the amount is 0.001 ETH; and the wallet retains enough ETH for gas.</p>
              </div>
            </section>

            <section id="message">
              <div className="chapter-label">05 / FIRST INTERACTION</div>
              <h2>Connect your wallet and submit a message</h2>
              <p>Return to the <Link href="/en" target="_blank" rel="noreferrer">quest page ↗</Link>. You will complete this step directly on the activity website.</p>
              <ol>
                <li>Select <strong>“Connect wallet”</strong>. When MetaMask opens, check the website domain, choose the test account you are using, and approve the connection.</li>
                <li>Confirm that the address on the page matches the one that received test ETH and that the network is <strong>Sepolia</strong>. If the network is wrong, select “Switch to Sepolia” and approve it in MetaMask.</li>
                <li>Enter a message such as <strong><code>Hello PKUBA!</code></strong> or <strong><code>I want to learn DeFi</code></strong>. The limit is 280 bytes, and the counter below the input updates as you type.</li>
                <li>Select <strong>“Write onchain”</strong>. The page checks the content, network, and estimated fee before MetaMask opens the transaction confirmation.</li>
              </ol>
              {settings.address ? (
                <ContractAddress address={settings.address} label="Quest contract address" locale="en" />
              ) : (
                <p>The activity website fills in the transaction target. Before signing, compare the contract address in your wallet with the published address.</p>
              )}
              <p>Your message is stored in a public <strong>event log</strong> and cannot be withdrawn from this website. Do not include your name, student ID, or other private information.</p>
              <div className="guide-callout">
                <strong>Connecting a wallet is not a transfer.</strong> A connection only allows the site to read your public address. When you actually write onchain, MetaMask opens a separate confirmation for you to review.
              </div>
            </section>

            <section id="receipt">
              <div className="chapter-label">06 / BLOCK EXPLORER</div>
              <h2>View your transaction and message</h2>
              <p>
                A <strong>block explorer</strong> is a website for searching public blockchain data—similar to a search engine for a blockchain. You can enter a wallet address, transaction hash, or contract address to see balances, transaction status, time, and fees. <strong>Etherscan</strong> is a commonly used block explorer for Ethereum Mainnet and test networks such as Sepolia. It reads public records; it is not a wallet, does not hold your assets, and requires no wallet connection to browse.
              </p>
              <p>
                <strong>Blockscout</strong> is another block explorer that reads the same public Sepolia data. This quest provides both: Etherscan is the primary link, and Blockscout is the backup when Etherscan is unreachable.
              </p>
              <p>
                A transaction hash is the unique identifier for one transaction, normally <code>0x</code> followed by 64 hexadecimal characters, for 66 characters total. It is different from a wallet address: one address can send many transactions, and every transaction has its own hash.
              </p>
              <ol>
                <li>Select <strong>“View on Etherscan”</strong>. If it does not open, select <strong>“Blockscout backup”</strong>. Both show the same Sepolia transaction.</li>
                <li>Find the <strong>transaction hash</strong> and use its copy button to save the complete value.</li>
                <li>The <strong>block</strong> is where the transaction was recorded, and the <strong>transaction fee</strong> is the amount actually paid.</li>
              </ol>
              <h3>Read your message in <strong>Logs</strong></h3>
              <p>The <strong>smart contract</strong> source code is verified, so the message is displayed as readable text.</p>
              <ol>
                <li>Open the Logs tab on the transaction page and find the event named <strong>MessageLeft</strong>.</li>
                <li>Confirm that the event’s <strong>Address</strong> is the quest contract address shown below.</li>
                <li><strong>sender</strong> is the wallet that posted the message, <strong>content</strong> is your message, and <strong>timestamp</strong> is the timestamp of the block containing it.</li>
              </ol>
              {settings.address && <ContractAddress address={settings.address} label="Quest contract address" locale="en" />}
              {nftEnabled && <p>After your first successful message, the contract also issues a commemorative <strong>non-fungible token (NFT)</strong> to your wallet in the same transaction. No extra signature or claim is needed; you can view it in MetaMask’s NFT section.</p>}
            </section>

            <section id="submit">
              <div className="chapter-label">07 / SUBMISSION</div>
              <h2>Submit the quest</h2>
              <p>Submit the complete transfer transaction hash and message transaction hash separately in the recruitment form.</p>
              <div className="guide-callout">
                <h3>🎉 Congratulations!</h3>
                <p>
                  You have completed your first onchain transaction and officially stepped into the world of blockchain! Next, you will gradually learn more skills: interacting with smart contracts, using DApps, and even deploying smart contracts of your own.
                </p>
                <p>This is the beginning of a brand-new journey. Welcome aboard 🚀</p>
              </div>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
