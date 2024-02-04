import * as fs from 'fs';
import { Keypair, Connection, PublicKey } from '@solana/web3.js';

const DEVNET_URL = 'https://api.devnet.solana.com';
const WALLET_FILE_PATH = 'wallets.json';

interface WalletData {
	wallets: { [name: string]: { publicKey: PublicKey; privateKey: Uint8Array } };
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
		console.error('Error saving wallet data:', error);
	}
}

export async function createWallet(walletName?: string): Promise<void> {
	const connection = new Connection(DEVNET_URL);

	const keypair = Keypair.generate();

	const walletData = loadWallet();
	const name = walletName || keypair.publicKey.toBase58();

	walletData.wallets[name] = {
		publicKey: keypair.publicKey,
		privateKey: keypair.secretKey,
	};

	saveWallet(walletData);

	console.log(`Wallet created successfully. Name: ${name}, Public key: ${keypair.publicKey.toBase58()}`);
}

export async function selectWallet(walletName: string): Promise<void> {
	const walletData = loadWallet();
	if (walletData.wallets[walletName]) {
		walletData.selectedWallet = walletName;
		saveWallet(walletData);
		console.log(`Selected wallet: ${walletName}`);
	} else {
		console.error('Error: Wallet not found.');
	}
}

export async function performAirdrop(X: string, options: { left: boolean }): Promise<void> {
	const connection = new Connection(DEVNET_URL);

	const walletData = loadWallet();
	const selectedWalletName = walletData.selectedWallet || Object.keys(walletData.wallets)[0]; // Use the first wallet if not selected
	const wallet = walletData.wallets[selectedWalletName];

	if (!wallet || !wallet.publicKey) {
		console.error('Error: Wallet not found.');
		return;
	}

	const amount = options.left ? 'LEFT' : X || '1';

	console.log(`Airdropping ${amount} SOL to wallet: ${wallet.publicKey.toBase58()}`);

	const airdropSignature = await connection.requestAirdrop(wallet.publicKey, +amount * 1e9); // Convert SOL to lamports

	await connection.confirmTransaction(airdropSignature);

	console.log('Airdrop completed successfully.');
}

export async function checkWalletBalance(walletName?: string): Promise<void> {
	const walletData = loadWallet();
	const selectedWalletName = walletData.selectedWallet || Object.keys(walletData.wallets)[0]; // Use the first wallet if not selected
	const wallet = walletData.wallets[selectedWalletName];

	if (!wallet) {
		console.error('Error: Wallet not found.');
		return;
	}

	const connection = new Connection(DEVNET_URL);
	console.log(typeof wallet.privateKey)
	try {
		const balance = await connection.getBalance(wallet.publicKey);
		console.log(`Wallet balance: ${balance / 1e9} SOL`); // Convert lamports to SOL
	} catch (error) {
		console.error('Error fetching balance:', error);
	}
}
