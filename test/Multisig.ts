import { expect } from "chai";
import { ethers } from "hardhat";
import { Multisig } from "../typechain-types";

describe("Multisig Contract", function () {
  let multisig: Multisig;
  let owner: any, signer1: any, signer2: any, nonSigner: any;

  beforeEach(async function () {
    [owner, signer1, signer2, nonSigner] = await ethers.getSigners();

    const validSigners = [owner.address, signer1.address, signer2.address]; // Include owner in valid signers

    const MultisigFactory = await ethers.getContractFactory("Multisig");

    multisig = (await MultisigFactory.deploy(2, validSigners)) as Multisig; // quorum of 2

    await multisig.waitForDeployment();
  });

  describe("updateQuorum", function () {
    it("should allow valid signers to propose and approve a quorum update", async function () {
      // Propose a quorum update to 3 by signer1
      await multisig.connect(signer1).updateQuorum(3);

      const txId = await multisig.txCount();

      // Check that the transaction was created correctly
      // const txDetails = await multisig.transactions(txId);
      // expect(txDetails.noOfApproval).to.equal(1); // Already approved by proposer
      // expect(txDetails.sender).to.equal(signer1.address);

      // Approve the quorum update by signer2
      await multisig.connect(signer2).approveQuorumUpdate(txId, 3);

      // Check the new quorum
      const newQuorum = await multisig.quorum();
      expect(newQuorum).to.equal(3);
    });

    it("should fail if non-signer tries to update quorum", async function () {
      await expect(
        multisig.connect(nonSigner).updateQuorum(3)
      ).to.be.revertedWith("only valid signers can propose quorum update");
    });

    it("should not allow quorum to be less than or equal to 1", async function () {
      await expect(
        multisig.connect(signer1).updateQuorum(1)
      ).to.be.revertedWith("quorum too small");
    });

    it("should not allow quorum to be greater than valid signers", async function () {
      await expect(
        multisig.connect(signer1).updateQuorum(4)
      ).to.be.revertedWith("quorum greater than valid signers");
    });

    it("should fail if a signer tries to approve a non-existent quorum update", async function () {
      await expect(
        multisig.connect(signer2).approveQuorumUpdate(999, 3)
      ).to.be.revertedWith("invalid tx id");
    });

    it("should fail if a signer tries to approve the same quorum update twice", async function () {
      // Propose a quorum update to 3 by signer1
      await multisig.connect(signer1).updateQuorum(3);

      const txId = await multisig.txCount();

      // Signer2 approves the quorum update
      await multisig.connect(signer2).approveQuorumUpdate(txId, 3);

      // Signer2 tries to approve the same quorum update again
      await expect(
        multisig.connect(signer2).approveQuorumUpdate(txId, 3)
      ).to.be.revertedWith("can't sign twice");
    });
  });
});
