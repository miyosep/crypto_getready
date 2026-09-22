# Practice website deployment

This release uses the existing verified **Sepolia practice contract**. Publishing
the website must not deploy a new contract.

Use the four public values in `practice-config.json` as Vercel Production and
Preview environment variables. These values are intentionally public. Do not
upload `.env.local`, its deployment backups, private keys, or Etherscan API keys.

- Framework: Next.js
- Project root: repository root
- Node.js: 22.x
- Install: `npm ci`
- Build: `npm run build`
- Output: Next.js default

The `NEXT_PUBLIC_*` values are embedded at build time. Changing them requires a
new deployment. Verify the `/guide` contract link uses the practice address and
that the homepage and NFT preview load over HTTPS after publishing.

Real wallet checks require a browser with MetaMask. Connecting a wallet does not
send a transaction; submitting a message requires the participant's approval.
Existing practice NFTs remain on the same contract.

For the later formal contract deployment, follow
[`verification/FORMAL-DEPLOYMENT.md`](../verification/FORMAL-DEPLOYMENT.md).
