const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 BNB Testnet Token Deployment Helper\n');
console.log('='.repeat(60));

// Check if Hardhat is installed
try {
    require.resolve('hardhat');
    console.log('✅ Hardhat is installed');
} catch (e) {
    console.log('❌ Hardhat is not installed');
    console.log('\nInstalling Hardhat and dependencies...\n');

    try {
        execSync('npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts', {
            stdio: 'inherit'
        });
        console.log('\n✅ Dependencies installed successfully');
    } catch (error) {
        console.error('❌ Failed to install dependencies');
        console.error('Please run: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts');
        process.exit(1);
    }
}

// Check for .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    process.exit(1);
}

// Read .env to check for DEPLOYER_PRIVATE_KEY
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DEPLOYER_PRIVATE_KEY') || envContent.includes('DEPLOYER_PRIVATE_KEY=""')) {
    console.log('\n⚠️  WARNING: DEPLOYER_PRIVATE_KEY not set in .env');
    console.log('\nTo deploy the contract, you need to:');
    console.log('1. Export your private key from MetaMask');
    console.log('2. Add it to .env file:');
    console.log('   DEPLOYER_PRIVATE_KEY="your_private_key_here"');
    console.log('3. Make sure you have test BNB: https://testnet.bnbchain.org/faucet-smart');
    console.log('\n⚠️  NEVER commit your private key to git!\n');
    process.exit(1);
}

console.log('✅ DEPLOYER_PRIVATE_KEY is set');

// Check if hardhat.config.ts exists
const hardhatConfigPath = path.join(__dirname, 'hardhat.config.ts');
if (!fs.existsSync(hardhatConfigPath)) {
    console.log('\n❌ hardhat.config.ts not found');
    console.log('Run: npx hardhat init');
    process.exit(1);
}

console.log('✅ hardhat.config.ts exists');
console.log('\n' + '='.repeat(60));
console.log('\n📋 Pre-deployment Checklist:');
console.log('   ✅ Hardhat installed');
console.log('   ✅ .env configured');
console.log('   ✅ hardhat.config.ts exists');
console.log('\n🔍 Next steps:');
console.log('   1. Ensure you have test BNB in your wallet');
console.log('   2. Copy TestBNBToken.sol to contracts/ folder');
console.log('   3. Create deployment script in scripts/deploy-bnb-token.ts');
console.log('   4. Run: npx hardhat run scripts/deploy-bnb-token.ts --network bscTestnet');
console.log('\n📖 See BNB_MIGRATION_GUIDE.md for detailed instructions\n');
