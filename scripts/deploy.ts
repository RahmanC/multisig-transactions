import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  //   console.log(`owner: ${owner.address}`);

  // Get the contract at the specified address
  const ercTokenAddr = "0xcf9203f511B680eA79807B740033BBdD62C2f284";
  const multisigWalletAddr = "0x2992029407938Fe20D5568C74EaB9A469FD45BaC";

  const multisigFactoryWallet = await ethers.getContractAt(
    "MultisigFactory",
    multisigWalletAddr
  );

  const validSigners = [
    "0x80bac8C84ef572c9b89F6501a03eA4685D3699D3",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
  ];

  // //Create Multisig Wallet
  // const createMultsigWallet = await multisigFactoryWallet.createMultisigWallet(
  //   3,
  //   validSigners
  // );
  // const wallet = await createMultsigWallet.wait();
  // console.log("Create clone wallet:", wallet);
  // const multisigWalletClone = await multisigFactoryWallet.getMultiSigClones();
  // console.log("Clone addresses: ", multisigWalletClone);

  const multisigWallet = await ethers.getContractAt(
    "Multisig",
    "0x80bac8C84ef572c9b89F6501a03eA4685D3699D3"
  );
  // transfer parameters
  const amountToTransfer = ethers.parseUnits("1", 18);
  const recipientAddr = "0xa34aaf88DE4767D46e374112a6D8F333b39C6246";

  // Initiate transfer from multisig wallet
  const transferTx = await multisigWallet.transfer(
    amountToTransfer,
    recipientAddr,
    ercTokenAddr
  );
  console.log("Transfer from multisig wallet initiated: ", transferTx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
