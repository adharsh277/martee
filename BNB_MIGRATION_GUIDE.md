# Migration to BNB Testnet - Complete Guide

## ✅ What Has Been Updated

### 1. Environment Variables (`.env`)
- **RPC Endpoints:**
  - WebSocket: `wss://bsc-testnet.publicnode.com`
  - HTTP: `https://data-seed-prebsc-1-s1.binance.org:8545`
- **Network Name:** `bsc-testnet`
- **Chain ID:** `97`
- **Min Confirmations:** `3` (increased for BNB)
- **Token Address:** Placeholder (needs deployment)

### 2. Frontend Configuration (`src/app/providers.tsx`)
- Replaced `sepolia` chain with `bscTestnet`
- Updated wagmi transports to use BNB Testnet
- Now uses environment variable for WalletConnect Project ID

### 3. Blockchain Listener (`services/blockchain-listener.ts`)
- Updated default RPC endpoints to BNB Testnet
- Changed network name to `bsc-testnet`
- Increased default confirmations to 3

### 4. Smart Contract (`contracts/TestBNBToken.sol`)
- Created new BEP-20 token contract for BNB Testnet
- Same functionality as TestMNEE (public minting, cooldown period)
- Token symbol: `tBNBP` (Test BNB Payment Token)

### 5. Frontend Pages
- **Faucet (`src/app/faucet/page.tsx`):**
  - Updated to show "BNB Testnet (BSC Testnet)"
  - Links now point to testnet.bscscan.com
  - References BNB testnet faucet for gas
  
- **Landing Page (`src/app/page.tsx`):**
  - Updated marketing copy to reference BNB testnet
  - Block explorer links point to BSCScan

---

## 🚀 Next Steps - Deploy Your Test Token

### Option 1: Using Hardhat (Recommended)

#### 1. Install Hardhat and Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
npx hardhat init
```

Select "Create a TypeScript project" when prompted.

#### 2. Update `hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    }
  }
};

export default config;
```

#### 3. Add Deployment Script

Create `scripts/deploy-bnb-token.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const initialSupply = ethers.parseUnits("1000000000", 18); // 1 billion tokens

  const TestBNBToken = await ethers.getContractFactory("TestBNBToken");
  const token = await TestBNBToken.deploy(initialSupply);

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("TestBNBToken deployed to:", address);
  console.log("\nUpdate your .env file with:");
  console.log(`MNEE_TOKEN_ADDRESS="${address}"`);
  console.log(`NEXT_PUBLIC_MNEE_TOKEN_ADDRESS="${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### 4. Add Private Key to `.env`

```env
# Add your deployer wallet private key (NEVER commit this!)
DEPLOYER_PRIVATE_KEY="your_private_key_here"

# Optional: For contract verification on BSCScan
BSCSCAN_API_KEY="your_bscscan_api_key"
```

⚠️ **IMPORTANT:** Add `DEPLOYER_PRIVATE_KEY` to `.gitignore`!

#### 5. Get Test BNB

Visit: https://testnet.bnbchain.org/faucet-smart

Request test BNB for gas fees.

#### 6. Deploy the Contract

```bash
npx hardhat run scripts/deploy-bnb-token.ts --network bscTestnet
```

#### 7. Update `.env` with Deployed Address

Copy the deployed contract address and update your `.env`:

```env
MNEE_TOKEN_ADDRESS="0xYourDeployedContractAddress"
NEXT_PUBLIC_MNEE_TOKEN_ADDRESS="0xYourDeployedContractAddress"
```

#### 8. Verify Contract on BSCScan (Optional)

```bash
npx hardhat verify --network bscTestnet DEPLOYED_CONTRACT_ADDRESS "1000000000000000000000000000"
```

---

### Option 2: Using Remix IDE (No Installation Required)

1. **Go to Remix:** https://remix.ethereum.org

2. **Create New File:**
   - Create file: `TestBNBToken.sol`
   - Copy contents from `contracts/TestBNBToken.sol`

3. **Compile:**
   - Click "Solidity Compiler" tab
   - Select compiler version: `0.8.20`
   - Click "Compile TestBNBToken.sol"

4. **Deploy:**
   - Click "Deploy & Run Transactions" tab
   - Environment: "Injected Provider - MetaMask"
   - Make sure MetaMask is connected to **BNB Testnet**
   - Constructor parameter: `1000000000000000000000000000` (1 billion tokens)
   - Click "Deploy"

5. **Copy Contract Address:**
   - After deployment, copy the contract address
   - Update your `.env` file

---

## 📝 BNB Testnet Network Details

### Add to MetaMask:
- **Network Name:** BNB Smart Chain Testnet
- **RPC URL:** https://data-seed-prebsc-1-s1.binance.org:8545
- **Chain ID:** 97
- **Currency Symbol:** tBNB
- **Block Explorer:** https://testnet.bscscan.com

---

## 🔄 Restart Your Application

After deploying the token and updating `.env`:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

Visit http://localhost:3000 and:
1. Connect wallet to BNB Testnet
2. Visit `/faucet` to mint test tokens
3. Test the payment functionality

---

## 🧪 Testing Checklist

- [ ] Token deployed on BNB Testnet
- [ ] `.env` updated with token address
- [ ] Application restarted
- [ ] Wallet connected to BNB Testnet (Chain ID: 97)
- [ ] Test BNB acquired for gas
- [ ] Faucet page works (minting tokens)
- [ ] Blockchain listener configured for BNB Testnet
- [ ] Payment flow tested end-to-end

---

## 📚 Additional Resources

- **BNB Testnet Faucet:** https://testnet.bnbchain.org/faucet-smart
- **BSCScan Testnet:** https://testnet.bscscan.com
- **BNB Chain Docs:** https://docs.bnbchain.org
- **Hardhat Docs:** https://hardhat.org/docs

---

## ⚠️ Important Notes

1. **Never commit private keys** - Add `DEPLOYER_PRIVATE_KEY` to `.gitignore`
2. **Testnet only** - These are test tokens with no real value
3. **Gas fees** - You need test BNB for all transactions
4. **Confirmations** - BNB blocks are faster, but we use 3 confirmations for safety
5. **Token standard** - BEP-20 is compatible with ERC-20, so the code works the same

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"
- Get more test BNB from the faucet

### "execution reverted: Mint cooldown period not elapsed"
- Wait 1 hour between mints or use a different wallet

### "Wrong network"
- Make sure MetaMask is connected to BNB Testnet (Chain ID: 97)

### Blockchain listener not seeing transfers
- Verify `ETHEREUM_RPC_WSS` and `MNEE_TOKEN_ADDRESS` in `.env`
- Check listener logs for connection errors
- Ensure token address is correct
