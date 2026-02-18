# 🚀 BNB Testnet Quick Reference

## Network Details
- **Chain ID:** 97
- **Network Name:** BNB Smart Chain Testnet
- **RPC (HTTP):** https://data-seed-prebsc-1-s1.binance.org:8545
- **RPC (WSS):** wss://bsc-testnet.publicnode.com
- **Explorer:** https://testnet.bscscan.com
- **Faucet:** https://testnet.bnbchain.org/faucet-smart

## Token Contract (After Deployment)
- **Name:** Test BNB Payment Token
- **Symbol:** tBNBP
- **Decimals:** 18
- **Address:** _Update after deployment_

## Important Commands

### Deploy Token (after Hardhat setup)
```bash
npx hardhat run scripts/deploy-bnb-token.ts --network bscTestnet
```

### Start Dev Server
```bash
npm run dev
```

### Run Blockchain Listener
```bash
npx ts-node services/blockchain-listener.ts
```

### Check Deployment Prerequisites
```bash
node setup-bnb-deployment.js
```

## MetaMask Setup
1. Networks → Add Network
2. Enter network details above
3. Get test BNB from faucet
4. Deploy contract or add token address

## Post-Deployment Checklist
- [ ] Token deployed to BNB Testnet
- [ ] Contract address in `.env`
- [ ] Dev server restarted
- [ ] Wallet connected to BNB Testnet
- [ ] Test BNB in wallet for gas
- [ ] Token visible in wallet (add custom token)
- [ ] Faucet page tested
- [ ] Payment flow tested

## Useful Links
- [BNB Chain Docs](https://docs.bnbchain.org)
- [BSCScan Testnet](https://testnet.bscscan.com)
- [BNB Faucet](https://testnet.bnbchain.org/faucet-smart)
- [Hardhat Docs](https://hardhat.org/docs)
