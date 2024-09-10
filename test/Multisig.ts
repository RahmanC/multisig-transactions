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
    it("should allow valid signers to update quorum", async function () {
      await multisig.connect(signer2).updateQuorum(3);
      expect(await multisig.quorum()).to.equal(3);
    });

    it("should fail if non-signer tries to update quorum", async function () {
      await expect(
        multisig.connect(nonSigner).updateQuorum(3)
      ).to.be.revertedWith("Only valid signers can update the quorum");
    });

    it("should not allow quorum to be less than or equal to 1", async function () {
      await expect(
        multisig.connect(signer1).updateQuorum(1)
      ).to.be.revertedWith("Quorum must be greater than 1");
    });

    it("should not allow quorum to be greater than valid signers", async function () {
      await expect(
        multisig.connect(signer1).updateQuorum(4)
      ).to.be.revertedWith(
        "New quorum cannot be greater than the number of valid signers"
      );
    });

    it("should fail if a signer tries to approve the quorum update that does not exist", async function () {
      await expect(
        multisig.connect(nonSigner).approveQuorumUpdate(1)
      ).to.be.revertedWith("invalid quorum update id");
    });
  });
});
