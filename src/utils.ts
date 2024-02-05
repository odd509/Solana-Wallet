import { Connection } from '@solana/web3.js';
import clc from 'cli-color';

import { loadWallet, saveWallet } from "./wallet"
const DEVNET_URL = 'https://api.devnet.solana.com';

export async function getNetworkStatus(): Promise<void> {
    const connection = new Connection(DEVNET_URL);

    try {
        const epochInfo = await connection.getEpochInfo();
        const slot = await connection.getSlot();
        const transactionCount = await connection.getTransactionCount('recent');
        const blockHeight = epochInfo.blockHeight;

        console.log(clc.bold.underline.magentaBright(`Network Status:`));
        console.log(clc.cyanBright(`Current Epoch: ${epochInfo.epoch}`));
        console.log(clc.greenBright(`Block Height: ${blockHeight}`));
        console.log(clc.magentaBright(`Current Slot: ${slot}`));
        console.log(clc.cyanBright(`Transaction Count: ${transactionCount}`));

    } catch (error) {
        console.error(clc.red('Error fetching network status:'), error);
    }
}

export async function updateBalances(): Promise<void> {
    const walletData = loadWallet();
    const connection = new Connection(DEVNET_URL);

    let n = 0
    for (const walletName in walletData.wallets) {
        const wallet = walletData.wallets[walletName];

        try {
            const balance = await connection.getBalance(wallet.publicKey);
            if (wallet.balance != balance) {
                n++;

                const diff = balance - wallet.balance
                if (diff > 0) {
                    // Wallet recieved SOL
                    console.log(clc.green("Wallet ", walletName, "balance increased by", diff / 1e9, "SOL"))

                } else {
                    // Wallet lost SOL
                    console.log(clc.red("Wallet ", walletName, "balance decreased by", diff / 1e9, "SOL"))

                }
            }

            wallet.balance = balance;

        } catch (error) {
            console.error(clc.red(`Error updating balance for ${walletName}:`, error));
        }
    }

    saveWallet(walletData);
    if (n != 0) {
        console.log(clc.italic.bgWhite("Updated", n, "Wallet Balances\n\n"))
    }
}


export function listWallets(displayPublic: boolean): void {
    const walletData = loadWallet();
    const wallets = Object.entries(walletData.wallets);

    if (wallets.length === 0) {
        console.log(clc.yellow('No wallets found.'));
        return;
    }

    console.log(clc.bold.underline.cyanBright('Wallets List:'));

    wallets.forEach(([walletName, wallet], index) => {
        console.log(
            clc.magentaBright(`${index + 1}. ${walletName}:`),
            displayPublic ? clc.cyanBright(wallet.publicKey.toBase58()) : '',
            clc.greenBright(`Balance: ${wallet.balance / 1e9} SOL`)
        );
    });
}

export function getBanner(): string {
    return `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Solana Wallet⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⡀⠀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣆⠀⠀⠀⠀⠀
    ⠀⠀⢸⣤⡀⠉⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠀⠀⠀⠀⠀
    ⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀
    ⠀⠀⢸⣿⣿⣿⣿⣿⡿⠛⠛⠛⠛⠛⠛⠛⠛⠛⢛⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀
    ⠀⠀⢸⣿⣿⣿⣿⣋⣀⣀⣀⣀⣀⣀⣀⣀⣀⣴⣿⣿⣿⡿⠟⠛⠛⠛⠛⠃⠀⠀
    ⠀⠀⢸⣿⣿⣿⣟⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⢿⣿⣿⡏⢀⣴⣶⣶⣶⣶⡆⠀⠀
    ⠀⠀⢸⣿⣿⣿⣿⣷⣦⣀⣀⣀⣀⣀⣀⣀⣀⣀⣙⣿⣇⠈⠻⠿⠿⠿⠿⠇⠀⠀
    ⠀⠀⢸⣿⣿⣿⣿⣿⡿⠛⠛⠛⠛⠛⠛⠛⠛⠛⢛⣿⣿⣷⣦⣤⣤⣤⣤⠀⠀⠀
    ⠀⠀⢸⣿⣿⣿⣿⣋⣀⣀⣀⣀⣀⣀⣀⣀⣀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
    ⠀⠀⠀⠈⠻⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠛⠁⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀-by odd509⠀⠀⠀`
}