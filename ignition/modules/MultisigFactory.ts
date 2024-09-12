import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultiSignatureFactoryModule = buildModule(
  "MultisigFactoryModule",
  (m) => {
    const multisig = m.contract("MultisigFactory");

    return { multisig };
  }
);

export default MultiSignatureFactoryModule;
