import { ethers } from "hardhat";
const hre = require("hardhat");

async function main() {
  const [owner, address1, address2, address3] = await hre.ethers.getSigners();

  // Create valid signers addresses
  const validSigners = [
    owner.address,
    address1.address,
    address2.address,
    address3.address,
  ];

  // Get the contract at the specified address
  const ercTokenAddr = "0xa5D3b3A71cEe86107a097EA1d267EB2aAe37f202";
  const multisigWalletAddr = "0x9a12Df38636155eb25Cde2321097aE659fE27d24";

  const multisigFactoryWallet = await ethers.getContractAt(
    "MultisigFactory",
    multisigWalletAddr
  );

  //Create Multisig Wallet
  const createMultsigWallet = await multisigFactoryWallet.createMultisigWallet(
    3,
    validSigners
  );

  const wallet = await createMultsigWallet.wait();
  console.log("Create clone wallet:", wallet);

  const multisigWalletClone = await multisigFactoryWallet.getMultiSigClones();

  const clonedWallet = multisigWalletClone[0];

  //Transfer token to clone address
  const ercToken = await ethers.getContractAt("ERC20Token", ercTokenAddr);
  const amount = ethers.parseUnits("2", 18);
  const trToken = await ercToken.transfer(clonedWallet, amount);
  trToken.wait();

  const multisigWallet = await ethers.getContractAt("Multisig", clonedWallet);

  // transfer parameters
  const amountToTransfer = ethers.parseUnits("1", 18);
  const recipientAddr = "0xa34aaf88DE4767D46e374112a6D8F333b39C6246";

  // Initiate transfer from multisig wallet
  const transferTx = await multisigWallet.transfer(
    amountToTransfer,
    recipientAddr,
    ercTokenAddr
  );
  console.log("Transfer from mulisig: ", transferTx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
