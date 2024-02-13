import clc from "cli-color";

import { saveWallet, checkWalletBalance } from "./wallet";
import { CONNECTION, WALLET_DATA } from "./index";

export async function getNetworkStatus(): Promise<void> {
	try {
		const epochInfo = await CONNECTION.getEpochInfo();
		const slot = await CONNECTION.getSlot();
		const transactionCount = await CONNECTION.getTransactionCount("recent");
		const blockHeight = epochInfo.blockHeight;

		console.log(clc.bold.underline.magentaBright(`Network Status:`));
		console.log(clc.cyanBright(`Current Epoch: ${epochInfo.epoch}`));
		console.log(clc.greenBright(`Block Height: ${blockHeight}`));
		console.log(clc.magentaBright(`Current Slot: ${slot}`));
		console.log(clc.cyanBright(`Transaction Count: ${transactionCount}`));
	} catch (error) {
		console.error(clc.red("Error fetching network status:"), error);
	}
}

export async function updateBalances(): Promise<void> {
	let n = 0;
	for (const walletName in WALLET_DATA.wallets) {
		const wallet = WALLET_DATA.wallets[walletName];

		try {
			const balance = await CONNECTION.getBalance(wallet.publicKey);
			if (wallet.balance != balance) {
				n++;

				const diff = balance - wallet.balance;
				if (diff > 0) {
					// Wallet recieved SOL
					console.log(
						clc.green(
							"Wallet ",
							walletName,
							"balance increased by",
							diff / 1e9,
							"SOL"
						)
					);
				} else {
					// Wallet lost SOL
					console.log(
						clc.red(
							"Wallet ",
							walletName,
							"balance decreased by",
							diff / 1e9,
							"SOL"
						)
					);
				}
			}

			wallet.balance = balance;
		} catch (error) {
			console.error(
				clc.red(`Error updating balance for ${walletName}:`, error)
			);
		}
	}

	saveWallet(WALLET_DATA);
	if (n != 0) {
		console.log(clc.italic.white("Updated", n, "Wallet Balance(s)") + "\n\n");
	}
}

export function listWallets(displayPublic: boolean): void {
	const wallets = Object.entries(WALLET_DATA.wallets);

	if (wallets.length === 0) {
		console.log(clc.yellow("No wallets found."));
		return;
	}

	console.log(clc.bold.underline.cyanBright("Wallets List:"));

	wallets.forEach(([walletName, wallet], index) => {
		console.log(
			clc.magentaBright(`${index + 1}. ${walletName}:`),
			displayPublic ? clc.cyanBright(wallet.publicKey.toBase58()) : "",
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
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀-by odd509⠀⠀⠀`;
}
