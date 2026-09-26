# 정식 계약 배포와 Etherscan 검증

## 사용자가 요청한 완료 기준

2026-09-22 요청: 지금 계약은 연습용이다. 이후 정식 계약을 배포할 때도
Etherscan 소스 검증과 ABI 공개를 진행해, 참가자가 별도 디코딩 도구 없이
Logs에서 `MessageLeft`와 중국어留言를 읽을 수 있게 한다.

정식 배포가 곧 Ethereum 메인넷 배포라는 뜻은 아니다. 현재 프로젝트와
배포 도우미는 Ethereum Sepolia(chain ID `11155111`)용이다. 별도 네트워크
변경 요청이 없으면 Sepolia를 유지한다.

## 연습 계약 기록

### 현재 송금 지원 버전 (2026-09-23)

- 주소: `0x060c21ba2cace101950464ee91ec85448678fb36`
- 배포 블록: `11763617`
- 배포 거래: `0x98c8e9d944d9f3002106d56f6d064a269f9e18f6401fa6caac084307097e5efe`
- 배포 및 회수 지갑: `0x22C20845Cc25612d6daBDDd6274627f9749006c6`
- 일반 송금 수신과 `TransferReceived` 이벤트 추가. 송금 여부는 留言 조건이 아니다.
- `withdraw()`는 배포 지갑만 호출할 수 있고 전체 ETH 잔액을 그 지갑으로만 보낸다.
- 19개 소스의 Standard JSON으로 Etherscan 바이트코드·ABI 검증 성공.
- 가이드 송금액: 0.02333 Sepolia ETH. 송금과 留言 해시를 각각 저장한다.
- 실제 신규 계약의 송금·회수·NFT 발급 거래 확인은 사용자 서명 후 진행한다.

### 이전 버전 (2026-09-22)

- 주소: `0x6844bcccd7959601416f5032600cdd5cb122ca85`
- 배포 블록: `11756665`
- 배포 거래: `0x01d93a3fddb5fb558184f39ff848812a89916310a186d7ec7bf01df89f2bff7c`
- 소스: `contracts/src/PKUBAGetReady.sol:PKUBAGetReady`
- Solidity: `v0.8.30+commit.73712a01`
- Optimizer: enabled, 200 runs; EVM: Cancun; viaIR: 미사용
- Constructor 인자: 없음; License: MIT
- 이미지: 1100 × 1100 정사각형, 좌우 문구 없음, 상하단 글씨 확대
- 검증: 로컬 runtime bytecode와 RPC로 조회한 배포 코드가 완전히 일치함을 확인
- Etherscan 웹에서 Standard JSON Input 업로드로 검증 성공(API 키 불필요)
- 아래 거래의 Logs에서 `content: 我想学习 DeFi`가 자동 표시되는 것까지 확인

[검증된 소스](https://sepolia.etherscan.io/address/0x6844bcccd7959601416f5032600cdd5cb122ca85#code)

[중국어 표시를 확인한 거래](https://sepolia.etherscan.io/tx/0x325e68707abcc758fcc7ddafce4b11e1f944dde0213917dd6e1cd7292b25e960#eventlog)

## 1. 정식 배포 준비

1. 최종 소스와 NFT 디자인을 확정한다. 이미지와 metadata는 불변이며 기존
   발급분의 디자인을 나중에 바꿀 수 없다.
2. `forge test`, `npm test`, `npm run test:integration`, `npm run typecheck`를 실행한다.
3. 배포 시점의 소스, compiler 설정, 의존성 lockfile, 컴파일 산출물을 보관한다.
   이후 소스가 변경되었으면 현재 코드가 아니라 실제 배포한 버전으로 검증한다.
4. 기존 배포 도우미를 종료하고, 최신 `forge build` 결과로
   `node scripts/deploy-with-wallet.mjs`를 다시 시작한다.
   도우미는 시작할 때 bytecode를 읽으므로 재시작하지 않으면 이전 버전이 배포된다.
5. 사용자가 MetaMask 브라우저에서 `http://127.0.0.1:3001/`에 접속해 승인한다.
   개인 키를 채팅에 받지 않는다.
6. 성공 receipt, 두 번의 confirmation, creation input, runtime bytecode를 확인한다.
   도우미가 검증 후 `.env.local`의 주소와 배포 블록, NFT 활성화를 변경한다.
   `.env.local.before-deploy-<tx hash>`에 직전 설정이 보관된다.
7. 정식 호스팅 환경에도 새 주소, 배포 블록, Sepolia RPC, NFT 활성화 설정을
   반영하고 다시 빌드/배포한다. 로컬 `.env.local` 변경만으로 호스팅은 바뀌지 않는다.

## 2. Etherscan 소스 검증 및 ABI 공개

단순 `Add Custom ABI`가 아니라 **Verify and Publish**를 사용한다.
공개 소스 검증이 되어야 방문자 모두가 동일한 ABI로 이벤트를 읽을 수 있다.

1. 새 계약의 RPC `getCode` 결과와 해당 빌드의
   `contracts/out/PKUBAGetReady.sol/PKUBAGetReady.json` 내
   `deployedBytecode.object`가 일치하는지 확인한다.
2. 새 배포 전용 디렉터리에 Standard JSON Input을 생성한다. 기존 연습용
   `PKUBAGetReady.standard-input.json`을 그대로 제출하지 않는다.
3. 생성 명령은 아래와 같다. `<NEW_ADDRESS>`를 실제 새 주소로 바꾼다.

   ```text
   forge verify-contract <NEW_ADDRESS> contracts/src/PKUBAGetReady.sol:PKUBAGetReady --chain 11155111 --show-standard-json-input
   ```

   이 명령은 로컬 JSON 출력용이다. 현재 foundry.toml은 API 키 환경변수를
   참조하므로 키가 없으면 출력 전에도 오류가 난다. 연습 배포에서는 Node의
   `execFileSync` 자식 프로세스 환경에만
   `ETHERSCAN_API_KEY: 'unused-for-local-export'`를 넣어 해결했다.
   실제 API 제출에 이 임시 값을 사용하지 않는다. 출력은 UTF-8(BOM 없음)으로
   저장하고 JSON 파싱 및 source content 포함 여부를 확인한다.
4. 새 주소의 Sepolia Etherscan → Contract → Verify and Publish로 들어간다.
5. Compiler Type은 **Solidity (Standard-Json-Input)**, Compiler Version은
   **실제 빌드 버전**, License는 소스의 SPDX에 맞춘다. 현재 설정은 위 기록과 같다.
6. 생성한 JSON을 업로드한다. 현재 계약은 constructor 인자가 없어 빈칸으로 둔다.
   Standard JSON에 optimizer, EVM version, remappings 등 실제 설정이 포함된다.
7. Verify and Publish를 제출하고
   `Successfully generated matching Bytecode and ABI` 성공 문구를 확인한다.
8. 새 계약 주소의 Code/Read Contract와 공개 ABI가 표시되는지 확인하고,
   새 주소·배포 거래·블록·compiler 설정·검증 결과를 기록한다.

API 키가 이미 설정되어 있으면 CLI의 `--verifier etherscan --watch` 방식도
가능하지만, 이번에 검증한 경로는 API 키 없는 웹 업로드 방식이다.

## 3. 참가자 관점의 최종 확인

1. 새 계약에서 중국어와 영문을 섞은 메시지(예: `我想学习 DeFi`)로 실제 성공
   거래를 확인한다. 지갑 승인은 사용자가 한다.
2. 그 거래의 Etherscan **Logs** 탭에서 `MessageLeft` 이벤트를 찾는다.
3. 이벤트 발생 주소가 새 정식 계약인지, `sender`가 작성자인지,
   `content`의 중국어가 정상 표시되는지 확인한다. Hex → Text 수동 변환이나
   CyberChef 사용을 필수 안내로 두지 않는다.
4. MetaMask 위임 실행에서는 바깥 거래의 `To`가 다른 주소일 수 있다.
   `MessageLeft`의 발생 주소와 이벤트 인자로 확인한다.
5. 최초留言에서 NFT가 발급되고 tokenURI 이미지가 최종 디자인인지 확인한다.
   지갑에서도 상하단 글씨가 잘리지 않는지 확인한다.
6. 사이트 성공 화면의 Etherscan 링크, 안내 문서의 계약 주소, 운영자 tx hash
   검증 도구가 모두 새 계약을 사용해야 한다.

기존 연습용 NFT와留言는 그대로 남으며 새 계약으로 자동 이동하지 않는다.
정식 계약에서 최초留言를 해야 새 NFT를 받는다. 소스 검증 자체는 가스비가
들지 않으며, 검증 후에는 기존 거래 로그도 ABI로 해석된다.
