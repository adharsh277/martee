const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║          🔧 Update Token Address Helper Script               ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('This script will update your .env file with the deployed token address.\n');

rl.question('Enter your deployed token contract address (0x...): ', (address) => {
    // Validate address format
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.log('\n❌ Invalid address format!');
        console.log('Address should be 42 characters starting with 0x');
        console.log('Example: 0x1234567890abcdef1234567890abcdef12345678\n');
        rl.close();
        return;
    }

    const envPath = path.join(__dirname, '.env');

    try {
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Replace both token addresses
        envContent = envContent.replace(
            /MNEE_TOKEN_ADDRESS="0x[a-fA-F0-9]{40}"/,
            `MNEE_TOKEN_ADDRESS="${address}"`
        );
        envContent = envContent.replace(
            /NEXT_PUBLIC_MNEE_TOKEN_ADDRESS="0x[a-fA-F0-9]{40}"/,
            `NEXT_PUBLIC_MNEE_TOKEN_ADDRESS="${address}"`
        );

        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ Success! Your .env file has been updated.\n');
        console.log('Token addresses updated to:', address);
        console.log('\n📋 Next steps:');
        console.log('   1. Restart your dev server (Ctrl+C, then npm run dev)');
        console.log('   2. Visit http://localhost:3000/faucet');
        console.log('   3. Connect wallet and mint tokens\n');
        console.log('🔍 Verify on BSCScan:');
        console.log(`   https://testnet.bscscan.com/address/${address}\n`);

    } catch (error) {
        console.log('\n❌ Error updating .env file:', error.message);
    }

    rl.close();
});
