import * as commander from 'commander';
import clc from 'cli-color';
import {
  createWallet,
  selectWallet,
  performAirdrop,
  checkWalletBalance,
  loadWallet,
  transfer,
  updateBalances
} from './wallet'; // Adjust the path accordingly

import { getNetworkStatus } from "./utils"

async function main() {

  const walletData = loadWallet();
  const selectedWalletName = walletData.selectedWallet || 'No wallet selected';
  console.log(clc.magentaBright("Selected Wallet: ") + clc.cyanBright(selectedWalletName))

  await updateBalances();

  const program = new commander.Command();
  program.version('1.0.0');

  program
    .command('new [walletName]')
    .description('Initialize a new wallet with an optional name')
    .action((walletName) => {
      createWallet(walletName);
    });

  program
    .command('select <walletName>')
    .description('Select a wallet for default operations')
    .action((walletName) => {
      selectWallet(walletName);
    });

  program
    .command('airdrop [X]')
    .description('Airdrop X SOL to the selected wallet (default 1)')
    .action((X) => {
      performAirdrop(X);
    });

  program
    .command('balance')
    .description('Check balance of the selected wallet')
    .action(() => {
      checkWalletBalance();
    });

  program
    .command('status')
    .description('Display Solana network status')
    .action(() => {
      getNetworkStatus();
    });

  program
    .command('transfer <otherPublicKey> <amount>')
    .description('Transfer SOL to another wallet')
    .action((otherPublicKey, amount) => {
      transfer(otherPublicKey, amount);
    });

  program.parse(process.argv);

  // If no command is specified, show help
  if (!process.argv.slice(2).length) {
    const walletData = loadWallet();
    const selectedWalletName = walletData.selectedWallet || 'No wallet selected';
    program.outputHelp((help) => help.replace('Usage:', `Selected Wallet: ${selectedWalletName}\n\nUsage:`));
  }
}

main()