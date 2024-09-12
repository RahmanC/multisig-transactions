import { expect } from "chai";
import { ethers } from "hardhat";
import { MultisigFactory, Multisig } from "../typechain-types";

describe("MultisigFactory Contract", function () {
  let multisigFactory: MultisigFactory;
  let owner: any, signer1: any, signer2: any, nonSigner: any;

  beforeEach(async function () {
    [owner, signer1, signer2, nonSigner] = await ethers.getSigners();

    const MultisigFactoryFactory = await ethers.getContractFactory(
      "MultisigFactory"
    );
    multisigFactory =
      (await MultisigFactoryFactory.deploy()) as MultisigFactory;

    await multisigFactory.waitForDeployment();
  });

  describe("createMultisigWallet", function () {
    it("should allow creation of a new multisig wallet", async function () {
      const validSigners = [owner.address, signer1.address, signer2.address];
      const quorum = 2;

      // Create a new multisig wallet
      const tx = await multisigFactory.createMultisigWallet(
        quorum,
        validSigners
      );
      const receipt: any = await tx.wait();

      const createdEvent = receipt?.events?.find(
        (event: any) => event.event === "Created"
      );
      expect(createdEvent).to.not.be.undefined;

      // const [newMultisigAddress, length] = await multisigFactory.callStatic.createMultisigWallet(quorum, validSigners);

      expect(length).to.equal(1); // Ensure one multisig clone has been created
      //   expect(newMultisigAddress).to.be.properAddress; // Check the new multisig wallet has a valid address
    });

    it("should allow multiple multisig wallets to be created", async function () {
      const validSigners1 = [owner.address, signer1.address];
      const validSigners2 = [owner.address, signer2.address];
      const quorum1 = 2;
      const quorum2 = 2;

      // Create two multisig wallets
      await multisigFactory.createMultisigWallet(quorum1, validSigners1);
      await multisigFactory.createMultisigWallet(quorum2, validSigners2);

      const multisigClones = await multisigFactory.getMultiSigClones();
      expect(multisigClones.length).to.equal(2); // Ensure two multisig wallets have been created
    });
  });

  describe("getMultiSigClones", function () {
    it("should return all created multisig wallets", async function () {
      const validSigners = [owner.address, signer1.address];
      const quorum = 2;

      // Create two multisig wallets
      await multisigFactory.createMultisigWallet(quorum, validSigners);
      await multisigFactory.createMultisigWallet(quorum, [
        owner.address,
        signer2.address,
      ]);

      const multisigClones = await multisigFactory.getMultiSigClones();
      expect(multisigClones.length).to.equal(2); // Check that both wallets are stored
    });

    it("should return an empty array if no multisig wallets have been created", async function () {
      const multisigClones = await multisigFactory.getMultiSigClones();
      expect(multisigClones.length).to.equal(0); // No wallets created yet
    });
  });
});
