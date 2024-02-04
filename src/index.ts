import * as commander from 'commander';
import {
  createWallet,
  selectWallet,
  performAirdrop,
  checkWalletBalance,
  loadWallet,
} from './wallet'; // Adjust the path accordingly

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
  .option('-l, --left', 'Use "LEFT" as the airdropped SOL amount')
  .action((X, options) => {
    performAirdrop(X, options);
  });

program
  .command('balance')
  .description('Check balance of the selected wallet')
  .action(() => {
    checkWalletBalance();
  });

program.parse(process.argv);

// If no command is specified, show help
if (!process.argv.slice(2).length) {
  const walletData = loadWallet();
  const selectedWalletName = walletData.selectedWallet || 'No wallet selected';
  program.outputHelp((help) => help.replace('Usage:', `Selected Wallet: ${selectedWalletName}\n\nUsage:`));
}

// Add any additional logic or commands as needed
