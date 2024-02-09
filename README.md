# Solana Wallet CLI
A simple command-line interface (CLI) for managing Solana wallets.

### Features

- Create a new Solana wallet with an optional name.
- Select a wallet for default operations.
- Perform airdrop of SOL to the selected wallet.
- Check the balance of the selected wallet.
- Display Solana network status.
- Transfer SOL to another wallet.
- List all wallets with names and balances.
- Update wallet balances and notify any changes automatically when the program starts.

### Installation
1) Clone the repository
```
git clone https://github.com/odd509/Solana-Wallet.git
```

2) Go to the project directory and install dependencies:
```
npm install
```

3) Compile the typescript code using:  
```
tsc
```

### Usage
Navigate to the `out` folder and run:
```
node index.js
```
- You can display the help menu using help flag (-h or --help).

### To - Do

* Use checkWalletBalance() for updateBalances() logic
* Estimated transfer fee calculation
* Change provided wallet name logic in wallets.transfer()
* Use global variables and imports
* Delete wallet command
* Add wallets using a secret key
* Derive child wallets using a parent wallet
* More Solana network status parameters (tps etc.)