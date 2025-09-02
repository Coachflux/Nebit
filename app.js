// Replace with your specific thirdweb client ID and contract address
const CLIENT_ID = "YOUR_CLIENT_ID";
const CONTRACT_ADDRESS = "0x65282B3EE25f216fa509669eC6C853eFf4863729";

// Import BNB Smart Chain object from thirdweb chains
const { bnbSmartChain, createThirdwebClient, getWallets, createWallet, connect, getActiveWallet, getContract, erc20, sendAndConfirmTransaction } = thirdweb;

// DOM elements
const connectWalletBtn = document.getElementById("connect-wallet-btn");
const walletStatusEl = document.getElementById("wallet-status");
const userAddressEl = document.getElementById("user-address");
const claimBtn = document.getElementById("claim-btn");
const claimQuantityEl = document.getElementById("claim-quantity");
const claimStatusEl = document.getElementById("claim-status");

// Initialize thirdweb client
const client = createThirdwebClient({
    clientId: CLIENT_ID,
});

// Create wallet manager for standard wallets like MetaMask
const wallets = getWallets();
const walletManager = createWallet(wallets, {
    client,
});

// Event listener for the Connect Wallet button
connectWalletBtn.addEventListener("click", async () => {
    try {
        const wallet = await connect(walletManager);
        const address = await wallet.getAddress();
        walletStatusEl.textContent = "Wallet Connected!";
        userAddressEl.textContent = `Address: ${address}`;
        connectWalletBtn.style.display = "none";
        claimBtn.disabled = false;
    } catch (error) {
        walletStatusEl.textContent = "Failed to connect wallet.";
        console.error("Failed to connect", error);
    }
});

// Event listener for the Claim button
claimBtn.addEventListener("click", async () => {
    const activeWallet = getActiveWallet();
    if (!activeWallet) {
        claimStatusEl.textContent = "Please connect your wallet first.";
        return;
    }

    try {
        claimStatusEl.textContent = "Claiming tokens...";
        claimBtn.disabled = true;

        const quantity = claimQuantityEl.value;
        
        // Get the Token Drop contract instance on the BSC network
        const contract = getContract({
            client: client,
            chain: bnbSmartChain, // Specify BNB Smart Chain
            address: CONTRACT_ADDRESS,
        });
        
        // Prepare the claim transaction for the Token Drop contract
        const transaction = erc20.claim({
            contract: contract,
            quantity: quantity,
        });

        // Send and confirm the transaction
        await sendAndConfirmTransaction({
            transaction: transaction,
            account: activeWallet,
        });

        claimStatusEl.textContent = `Successfully claimed ${quantity} tokens!`;
        claimStatusEl.style.color = "green";
    } catch (error) {
        claimStatusEl.textContent = "Claiming failed. Check the allowlist or claim limits.";
        claimStatusEl.style.color = "red";
        console.error("Claiming failed", error);
    } finally {
        claimBtn.disabled = false;
    }
});
