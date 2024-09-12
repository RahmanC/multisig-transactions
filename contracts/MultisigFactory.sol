// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Multisig.sol";

contract MultisigFactory {

    Multisig[] multisigClones;

    function createMultisigWallet(uint8 _quorum, address[] memory _validSigners) external returns (Multisig newMulsig_, uint256 length_) {

        newMulsig_ = new Multisig(_quorum, _validSigners);

        multisigClones.push(newMulsig_);

        length_ = multisigClones.length;
    }

    function getMultiSigClones() external view returns(Multisig[] memory) {
        return multisigClones;
    }
}

// ["0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", "0x617F2E2fD72FD9D5503197092aC168c91465E7f2"]