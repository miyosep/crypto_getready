// Local-only deployment helper. Signing stays in the browser wallet.
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifact = JSON.parse(readFileSync(root + 'contracts/out/PKUBAGetReady.sol/PKUBAGetReady.json', 'utf8'));
const bytecode = artifact.bytecode.object;
const storageKey = 'getready-nft-' + createHash('sha256').update(bytecode).digest('hex').slice(0, 16);
const rpc = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(rpc) });
const token = randomBytes(24).toString('hex');
const origin = 'http://127.0.0.1:3001';

const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>Get Ready · Sepolia 배포</title>
<style>body{font:17px/1.7 system-ui;max-width:720px;margin:80px auto;padding:24px;color:#27272a}button{background:#a6192e;color:white;border:0;border-radius:8px;padding:14px 24px;font:inherit;cursor:pointer}button:disabled{opacity:.5}pre{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#a6192e}</style>
<h1>Get Ready · NFT 계약 배포</h1><img src="/artwork.svg" alt="Get Ready NFT" width="240" height="300"><p>첫留言과 함께 기념 NFT를 지갑당 한 개 발행하는 새 계약을 Ethereum Sepolia에 배포합니다. 실제 ETH 전송 금액은 0이며, Sepolia ETH로 가스비만 지불합니다.</p>
<p>승인 후 배포가 확인되면 사이트의 계약 설정을 자동으로 저장합니다.</p>
<button id="deploy">MetaMask로 배포하기</button><pre id="status">MetaMask가 설치된 PC 브라우저에서 열어 주세요.</pre>
<script>
const button = document.querySelector('#deploy');
const status = document.querySelector('#status');
const wallets = [];
window.addEventListener('eip6963:announceProvider', e => wallets.push(e.detail));
window.dispatchEvent(new Event('eip6963:requestProvider'));
let hash = sessionStorage.getItem(${JSON.stringify(storageKey)});
if (hash) { button.textContent = '배포 결과 확인하기'; status.textContent = '기존 트랜잭션: ' + hash; }
button.onclick = async () => {
  button.disabled = true;
  try {
    if (!hash) {
      const provider = wallets.find(w => w.info.rdns === 'io.metamask')?.provider || window.ethereum?.providers?.find(p => p.isMetaMask) || window.ethereum;
      if (!provider) throw Error('MetaMask가 설치된 브라우저에서 이 주소를 열어 주세요.');
      const accounts = await provider.request({method:'eth_requestAccounts'});
      try { await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xaa36a7'}]}); }
      catch (e) {
        if (e.code !== 4902) throw e;
        await provider.request({method:'wallet_addEthereumChain',params:[{chainId:'0xaa36a7',chainName:'Ethereum Sepolia',nativeCurrency:{name:'Sepolia ETH',symbol:'ETH',decimals:18},rpcUrls:[${JSON.stringify(rpc)}],blockExplorerUrls:['https://sepolia.etherscan.io']}]});
      }
      if (await provider.request({method:'eth_chainId'}) !== '0xaa36a7') throw Error('Ethereum Sepolia로 전환해 주세요.');
      status.textContent = 'MetaMask에서 계약 배포 내용을 확인하고 승인해 주세요.';
      hash = await provider.request({method:'eth_sendTransaction',params:[{from:accounts[0],data:${JSON.stringify(bytecode)},value:'0x0'}]});
      sessionStorage.setItem(${JSON.stringify(storageKey)}, hash);
    }
    status.textContent = '배포 확인 중… 브라우저를 열어 두세요.\\n' + hash;
    const response = await fetch('/complete',{method:'POST',headers:{'Content-Type':'application/json','X-Deploy-Token':${JSON.stringify(token)}},body:JSON.stringify({hash})});
    const result = await response.json();
    if (!response.ok) throw Error(result.error);
    status.textContent = '배포 및 사이트 설정 완료!\\n계약 주소: ' + result.address + '\\n배포 블록: ' + result.block + '\\n트랜잭션: ' + hash + '\\n원래 사이트를 새로고침해 주세요.';
    button.textContent = '배포 완료';
    const link = document.createElement('a'); link.href = 'https://sepolia.etherscan.io/tx/' + hash; link.textContent = 'Etherscan에서 확인'; link.target = '_blank'; link.rel = 'noreferrer'; document.body.append(link);
  } catch (e) { status.textContent = e.message; button.disabled = false; button.textContent = hash ? '배포 결과 다시 확인' : 'MetaMask로 배포하기'; }
};
</script></html>`;

const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Frame-Options', 'DENY');
  if (req.headers.host !== '127.0.0.1:3001') { res.writeHead(403).end(); return; }
  if (req.method === 'GET' && req.url === '/artwork.svg') { res.setHeader('Content-Type', 'image/svg+xml'); res.end(readFileSync(root + 'public/quest-nft.svg')); return; }
  if (req.method === 'GET' && req.url === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); return; }
  if (req.method !== 'POST' || req.url !== '/complete' || req.headers.origin !== origin || req.headers['x-deploy-token'] !== token) { res.writeHead(403).end(); return; }
  res.setHeader('Content-Type', 'application/json');
  try {
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 1024) throw Error('Invalid request'); }
    const { hash } = JSON.parse(body);
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw Error('Invalid transaction hash');
    if (await client.getChainId() !== sepolia.id) throw Error('RPC network mismatch');
    const receipt = await client.waitForTransactionReceipt({ hash, confirmations: 2, timeout: 180_000 });
    const tx = await client.getTransaction({ hash });
    if (receipt.status !== 'success' || !receipt.contractAddress || tx.to !== null || tx.input.toLowerCase() !== bytecode.toLowerCase() || tx.value !== 0n) throw Error('Expected contract deployment not found');
    const code = await client.getCode({ address: receipt.contractAddress });
    if (code?.toLowerCase() !== artifact.deployedBytecode.object.toLowerCase()) throw Error('Deployed bytecode mismatch');
    const path = root + '.env.local';
    let env = existsSync(path) ? readFileSync(path, 'utf8') : '';
    // Keep a recovery copy before switching away from the original contract.
    if (env && !existsSync(root + '.env.local.before-nft')) writeFileSync(root + '.env.local.before-nft', env);
    const values = { NEXT_PUBLIC_GUESTBOOK_CONTRACT_ADDRESS: receipt.contractAddress, NEXT_PUBLIC_DEPLOYMENT_BLOCK: receipt.blockNumber.toString(), NEXT_PUBLIC_SEPOLIA_RPC_URL: rpc, NEXT_PUBLIC_QUEST_NFT_ENABLED: 'true' };
    for (const [key, value] of Object.entries(values)) {
      const pattern = new RegExp('^' + key + '=.*$', 'm');
      env = pattern.test(env) ? env.replace(pattern, key + '=' + value) : env.trimEnd() + '\n' + key + '=' + value + '\n';
    }
    writeFileSync(path, env.trimStart());
    const result = { address: receipt.contractAddress, block: receipt.blockNumber.toString(), hash };
    console.log('DEPLOYMENT_CONFIRMED', JSON.stringify(result));
    res.end(JSON.stringify(result));
  } catch (error) { res.writeHead(400); res.end(JSON.stringify({ error: error.shortMessage || error.message })); }
});
server.listen(3001, '127.0.0.1', () => console.log('Wallet deployment: ' + origin));
