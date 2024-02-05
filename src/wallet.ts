import * as fs from 'fs';
import { Keypair, Connection, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import clc from 'cli-color';

const DEVNET_URL = 'https://api.devnet.solana.com';
const WALLET_FILE_PATH = 'wallets.json';

interface WalletData {
	wallets: { [name: string]: { publicKey: PublicKey; privateKey: Uint8Array; balance: number } };
	selectedWallet?: string;
}

export function loadWallet(): WalletData {
	try {
		const data = fs.readFileSync(WALLET_FILE_PATH, 'utf-8');
		const parsedData: WalletData = JSON.parse(data);

		// Convert public key data to PublicKey object
		for (const walletName in parsedData.wallets) {
			const wallet = parsedData.wallets[walletName];
			wallet.publicKey = new PublicKey(wallet.publicKey);
		}

		return parsedData;
	} catch (error) {
		console.error(clc.red('Error loading wallet data:', error));
		return { wallets: {}, selectedWallet: undefined };
	}
}

export function saveWallet(walletData: WalletData): void {
	try {
		const existingData = loadWallet();
		const newData: WalletData = {
			wallets: {
				...existingData.wallets,
				...walletData.wallets,
			},
			selectedWallet: walletData.selectedWallet,
		};
		const data = JSON.stringify(newData, null, 2);
		fs.writeFileSync(WALLET_FILE_PATH, data, 'utf-8');
	} catch (error) {
		console.error(clc.red('Error saving wallet data:', error));
	}
}

export async function createWallet(walletName?: string): Promise<void> {
	const connection = new Connection(DEVNET_URL);

	const keypair = Keypair.generate();

	const walletData = loadWallet();
	const name = walletName || keypair.publicKey.toBase58();

	console.log(keypair)
	walletData.wallets[name] = {
		publicKey: keypair.publicKey,
		privateKey: keypair.secretKey,
		balance: 0
	};

	saveWallet(walletData);

	console.log(clc.green("Wallet created successfully."), clc.bold(`Name: ${name}, Public key: ${keypair.publicKey.toBase58()}\n`));
}

export async function selectWallet(walletName: string): Promise<void> {
	const walletData = loadWallet();
	if (walletData.wallets[walletName]) {
		walletData.selectedWallet = walletName;
		saveWallet(walletData);
		console.log(clc.cyan("Selected wallet changed to: ${walletName}\n"));
	} else {
		console.error(clc.red("Error: Wallet not found."));
	}
}

export async function performAirdrop(X: string): Promise<void> {
	const connection = new Connection(DEVNET_URL);

	const walletData = loadWallet();
	const selectedWalletName = walletData.selectedWallet || Object.keys(walletData.wallets)[0]; // Use the first wallet if not selected
	const wallet = walletData.wallets[selectedWalletName];

	if (!wallet || !wallet.publicKey) {
		console.error(clc.red('Error: Wallet not found.'));
		return;
	}

	const amount = X || '1';

	console.log(clc.yellow(`Airdropping ${amount} SOL to wallet: ${wallet.publicKey.toBase58()}`));

	const airdropSignature = await connection.requestAirdrop(wallet.publicKey, +amount * 1e9); // Convert SOL to lamports

	await connection.confirmTransaction(airdropSignature);

	console.log(clc.green('Airdrop completed successfully.'));
}

export async function checkWalletBalance(walletName?: string): Promise<void> {
	const walletData = loadWallet();
	const selectedWalletName = walletData.selectedWallet || Object.keys(walletData.wallets)[0]; // Use the first wallet if not selected
	const wallet = walletData.wallets[selectedWalletName];

	if (!wallet) {
		console.error(clc.red('Error: Wallet not found.'));
		return;
	}

	const connection = new Connection(DEVNET_URL);
	try {
		const balance = await connection.getBalance(wallet.publicKey);

		wallet.balance = balance
		walletData.wallets[selectedWalletName] = wallet
		saveWallet(walletData)

		console.log(clc.green(`Wallet balance: ${balance / 1e9} SOL`)); // Convert lamports to SOL
	} catch (error) {
		console.error(clc.red('Error fetching balance:', error));
	}
}


export async function transfer(otherPublicKey: string, amount: string): Promise<void> {
	const connection = new Connection(DEVNET_URL);

	// Load selected wallet
	const walletData = loadWallet();
	const selectedWalletName = walletData.selectedWallet || Object.keys(walletData.wallets)[0];
	const selectedWallet = walletData.wallets[selectedWalletName];

	if (!selectedWallet || !selectedWallet.publicKey) {
		console.error('Error: Wallet not found.');
		return;
	}

	// Convert SOL to lamports
	const amountLamports = parseFloat(amount) * 1e9;

	let toPublicKey: PublicKey;

	if (walletData.wallets[otherPublicKey] && walletData.wallets[otherPublicKey].publicKey) {
		// Check if the provided publicKey is a wallet name or not
		toPublicKey = walletData.wallets[otherPublicKey].publicKey;
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

	const bytearray = new Uint8Array(Object.values(selectedWallet.privateKey))
	const keypair = Keypair.fromSecretKey(bytearray)

	// Sign and send the transaction
	const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
	console.log(clc.greenBright("Transfer completed successfully. Transaction signature: " + clc.magentaBright(signature)));
}

