import * as commander from "commander";
import clc from "cli-color";
import { Connection } from "@solana/web3.js";

export const WALLET_FILE_PATH: string = "wallets.json";

import {
  createWallet,
  selectWallet,
  performAirdrop,
  checkWalletBalance,
  loadWallet,
  transfer,
} from "./wallet";

import {
  getBanner,
  getNetworkStatus,
  listWallets,
  updateBalances,
} from "./utils";

export const WALLET_DATA = loadWallet();
export const SELECTED_WALLET_NAME =
  WALLET_DATA.selectedWallet || "No wallet selected";
export const DEVNET_URL = "https://api.devnet.solana.com";
export const CONNECTION = new Connection(DEVNET_URL);

async function main() {
  const showBanner =
    process.argv.includes("-h") ||
    process.argv.includes("--help") ||
    !process.argv.slice(2).length;

  if (showBanner) {
    console.log(getBanner());
  }

  console.log(
    clc.underline.magentaBright("Selected Wallet:") +
      " " +
      clc.cyanBright(SELECTED_WALLET_NAME + "\n")
  );

  await updateBalances();

  const program = new commander.Command();
  program.version("1.0.0");

  program
    .command("new [walletName]")
    .description("Initialize a new wallet with an optional name")
    .action((walletName) => {
      createWallet(walletName);
    });

  program
    .command("select <walletName>")
    .description("Select a wallet for default operations")
    .action((walletName) => {
      selectWallet(walletName);
    });

  program
    .command("airdrop [X]")
    .description("Airdrop X SOL to the selected wallet (default 1)")
    .action((X) => {
      performAirdrop(X);
    });

  program
    .command("balance")
    .description("Check balance of the selected wallet")
    .action(() => {
      checkWalletBalance();
    });

  program
    .command("status")
    .description("Display Solana network status")
    .action(() => {
      getNetworkStatus();
    });

  program
    .command("transfer <otherPublicKey/walletName> <amount>")
    .description(
      "Transfer SOL to another wallet using public key or wallets name"
    )
    .action((otherPublicKey, amount) => {
      transfer(otherPublicKey, amount);
    });

  program
    .command("list")
    .description("List all wallets with names and balances")
    .option("-p, --public", "Display public addresses")
    .action((options) => {
      listWallets(options.public);
    });

  program.parse(process.argv);

  // If no command is specified, show help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

main();
