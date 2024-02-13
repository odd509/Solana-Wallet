# 🌌 Solana Wallet CLI

A simple command-line interface (CLI) for managing Solana wallets.

## 🚀 Key Features

- **Create Wallet:** Easily generate a new Solana wallet, with the option to assign a custom name.
- **Default Wallet:** Select a default wallet for quick operations.
- **Airdrop SOL:** Initiate an airdrop of SOL to your selected wallet effortlessly.
- **Check Balance:** Stay informed about the balance of your chosen wallet.
- **Network Insights:** Quickly view Solana network status for up-to-date information.
- **Transfer SOL:** Move SOL to another wallet with a simple command.
- **Wallet Overview:** List all wallets along with their names and balances.
- **Auto-Update:** Automated updates of wallet balances, with notifications upon program startup.

## 🛠️ Installation

1.  Clone the repository

```
git clone https://github.com/odd509/Solana-Wallet.git
```

2. Navigate to the project directory and install dependencies:

```
npm install
```

3. Compile TypeScript code:

```
tsc
```

## 💳 Usage

Navigate to the `out` folder and run:

```
node index.js
```

For additional assistance, access the help menu using the `-h` or `--help` flag.

## 🎯 To-Do List

- Implement estimated transfer fee calculations.
- Change provided wallet name logic in wallets.transfer().
- ~~Optimize the use of global variables and imports.~~
- Introduce a delete wallet command.
- Add wallets using a secret key.
- Derive child wallets from a parent wallet for a hierarchical structure.
- Expand network status parameters (e.g., TPS) for better insights.
