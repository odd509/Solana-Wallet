import { Connection } from '@solana/web3.js';
import clc from 'cli-color';

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
