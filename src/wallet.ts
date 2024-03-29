import * as fs from "fs";
import {
	Keypair,
	Connection,
	PublicKey,
	sendAndConfirmTransaction,
	SystemProgram,
	Transaction,
} from "@solana/web3.js";
import {
	WALLET_DATA,
	WALLET_FILE_PATH,
	DEVNET_URL,
	SELECTED_WALLET_NAME,
	CONNECTION,
} from "./index";
import clc from "cli-color";

interface WalletData {
	wallets: {
		[name: string]: {
			publicKey: PublicKey;
			privateKey: Uint8Array;
			balance: number;
		};
	};
	selectedWallet?: string;
}

export function loadWallet(): WalletData {
	try {
		const data = fs.readFileSync(`../${WALLET_FILE_PATH}`, "utf-8");
		const parsedData: WalletData = JSON.parse(data);

		// Convert public key data to PublicKey object
		for (const walletName in parsedData.wallets) {
			const wallet = parsedData.wallets[walletName];
			wallet.publicKey = new PublicKey(wallet.publicKey);
		}

		return parsedData;
	} catch (error) {
		console.error(clc.red("Error loading wallet data:", error));
		return { wallets: {}, selectedWallet: undefined };
	}
}

export function saveWallet(newWalletData: WalletData): void {
	try {
		const newData: WalletData = {
			wallets: {
				...WALLET_DATA.wallets,
				...newWalletData.wallets,
			},
			selectedWallet: newWalletData.selectedWallet,
		};
		const data = JSON.stringify(newData, null, 2);
		fs.writeFileSync(`../${WALLET_FILE_PATH}`, data, "utf-8");
	} catch (error) {
		console.error(clc.red("Error saving wallet data:", error));
	}
}

export function createWallet(walletName?: string): void {
	const keypair = Keypair.generate();
	const name = walletName || keypair.publicKey.toBase58();

	WALLET_DATA.wallets[name] = {
		publicKey: keypair.publicKey,
		privateKey: keypair.secretKey,
		balance: 0,
	};

	saveWallet(WALLET_DATA);

	console.log(
		clc.green("Wallet created successfully."),
		clc.bold(`Name: ${name}, Public key: ${keypair.publicKey.toBase58()}\n`)
	);
}

export function selectWallet(walletName: string): void {
	if (WALLET_DATA.wallets[walletName]) {
		WALLET_DATA.selectedWallet = walletName;
		saveWallet(WALLET_DATA);
		console.log(clc.cyan("Selected wallet changed to:", walletName, "\n"));
	} else {
		console.error(clc.red("Error: Wallet not found."));
	}
}

export async function performAirdrop(X: string): Promise<void> {
	// Check if wallet data is empty
	if (!WALLET_DATA.wallets || Object.keys(WALLET_DATA.wallets).length === 0) {
		throw new Error("Wallets list is empty");
	}

	const selectedWalletName =
		WALLET_DATA.selectedWallet || Object.keys(WALLET_DATA.wallets)[0]; // Use the first wallet if not selected
	const wallet = WALLET_DATA.wallets[selectedWalletName];

	if (!wallet || !wallet.publicKey) {
		console.error(clc.red("Error: Wallet not found."));
		return;
	}

	const amount = X || "1";

	console.log(
		clc.yellow(
			`Airdropping ${amount} SOL to wallet: ${wallet.publicKey.toBase58()}`
		)
	);

	const airdropSignature = await CONNECTION.requestAirdrop(
		wallet.publicKey,
		+amount * 1e9
	); // Convert SOL to lamports

	await CONNECTION.confirmTransaction(airdropSignature);

	console.log(clc.green("Airdrop completed successfully."));
}

export async function checkWalletBalance(
	walletName: string = SELECTED_WALLET_NAME
): Promise<void> {
	const wallet = WALLET_DATA.wallets[walletName];

	if (!wallet) {
		console.error(clc.red("Error: Wallet not found."));
		return;
	}

	const connection = new Connection(DEVNET_URL);
	try {
		const balance = await connection.getBalance(wallet.publicKey);

		wallet.balance = balance;
		WALLET_DATA.wallets[walletName] = wallet;
		saveWallet(WALLET_DATA);

		console.log(clc.green(`Wallet balance: ${balance / 1e9} SOL`)); // Convert lamports to SOL
	} catch (error) {
		console.error(clc.red("Error fetching balance:", error));
	}
}

export async function transfer(
	otherPublicKey: string,
	amount: string,
	autoApprove: boolean
): Promise<void> {
	// Load selected wallet
	const selectedWallet = WALLET_DATA.wallets[SELECTED_WALLET_NAME];

	if (!selectedWallet || !selectedWallet.publicKey) {
		console.error("Error: Wallet not found.");
		return;
	}

	// Convert SOL to lamports
	const amountLamports = parseFloat(amount) * 1e9;

	let toPublicKey: PublicKey;

	if (
		WALLET_DATA.wallets[otherPublicKey] &&
		WALLET_DATA.wallets[otherPublicKey].publicKey
	) {
		// Check if the provided publicKey is a wallet name or not
		toPublicKey = WALLET_DATA.wallets[otherPublicKey].publicKey;
	} else {
		toPublicKey = new PublicKey(otherPublicKey);
	}

	// Create a transaction for the transfer
	const transaction = new Transaction().add(
		SystemProgram.transfer({
			fromPubkey: selectedWallet.publicKey,
			toPubkey: toPublicKey,
			lamports: amountLamports,
		})
	);

	transaction.feePayer = selectedWallet.publicKey;
	transaction.recentBlockhash = (
		await CONNECTION.getLatestBlockhash()
	).blockhash;

	// Get the estimated fee for the transaction
	const estimatedFee = await transaction.getEstimatedFee(CONNECTION);

	// Display the estimated fee to the user
	if (estimatedFee) {
		console.log(
			clc.yellow(`Estimated transaction fee: ${estimatedFee / 1e9} SOL`)
		);
	} else {
		console.log(clc.red("Could not get the estimated transaction fee"));
	}

	// If autoApprove is true or user explicitly approves, proceed with the transfer
	if (autoApprove || (await promptForApproval())) {
		// Sign and send the transaction
		const bytearray = new Uint8Array(Object.values(selectedWallet.privateKey));
		const keypair = Keypair.fromSecretKey(bytearray);
		const signature = await sendAndConfirmTransaction(CONNECTION, transaction, [
			keypair,
		]);
		console.log(
			clc.greenBright(
				"Transfer completed successfully. Transaction signature: " +
					clc.magentaBright(signature)
			)
		);
	} else {
		console.log(clc.yellow("Transfer not approved."));
	}
}

async function promptForApproval(): Promise<boolean> {
	const readline = require("readline");
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(
			"Do you want to approve the transaction? (y/N): ",
			(answer: string) => {
				rl.close();
				resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
			}
		);
	});
}
