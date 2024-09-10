// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Multisig {
    uint8 public quorum;
    uint8 public noOfValidSigners;
    uint256 public txCount;
    uint256 public quorumUpdateCount;

    struct Transaction {
        uint256 id;
        uint256 amount;
        address sender;
        address recipient;
        bool isCompleted;
        uint256 timestamp;
        uint256 noOfApproval;
        address tokenAddress;
        address[] transactionSigners;
    }

    struct QuorumUpdate {
        uint256 id;
        uint8 newQuorum;
        bool isCompleted;
        uint256 noOfApproval;
        address[] signers;
    }

    mapping(address => bool) isValidSigner;
    mapping(uint => Transaction) transactions; // txId -> Transaction
    // signer -> transactionId -> bool (checking if an address has signed)
    mapping(address => mapping(uint256 => bool)) hasSigned;

     mapping(uint => QuorumUpdate) quorumUpdates; // quorumUpdateId -> QuorumUpdate
     mapping(address => mapping(uint256 => bool)) hasSignedQuorumUpdate; // signer -> quorumUpdateId -> bool

    constructor(uint8 _quorum, address[] memory _validSigners) {
        require(_validSigners.length > 1, "few valid signers");
        require(_quorum > 1, "quorum is too small");


        for(uint256 i = 0; i < _validSigners.length; i++) {
            require(_validSigners[i] != address(0), "zero address not allowed");
            require(!isValidSigner[_validSigners[i]], "signer already exist");

            isValidSigner[_validSigners[i]] = true;
        }

        noOfValidSigners = uint8(_validSigners.length);

        if (!isValidSigner[msg.sender]){
            isValidSigner[msg.sender] = true;
            noOfValidSigners += 1;
        }

        require(_quorum <= noOfValidSigners, "quorum greater than valid signers");
        quorum = _quorum;
    }

    function transfer(uint256 _amount, address _recipient, address _tokenAddress) external {
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");

        require(_amount > 0, "can't send zero amount");
        require(_recipient != address(0), "address zero found");
        require(_tokenAddress != address(0), "address zero found");

        require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");

        uint256 _txId = txCount + 1;
        Transaction storage trx = transactions[_txId];
        
        trx.id = _txId;
        trx.amount = _amount;
        trx.recipient = _recipient;
        trx.sender = msg.sender;
        trx.timestamp = block.timestamp;
        trx.tokenAddress = _tokenAddress;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);
        hasSigned[msg.sender][_txId] = true;

        txCount += 1;
    }

    function approveTx(uint8 _txId) external {
        Transaction storage trx = transactions[_txId];

        require(trx.id != 0, "invalid tx id");
        
        require(IERC20(trx.tokenAddress).balanceOf(address(this)) >= trx.amount, "insufficient funds");
        require(!trx.isCompleted, "transaction already completed");
        require(trx.noOfApproval < quorum, "approvals already reached");

        // for(uint256 i = 0; i < trx.transactionSigners.length; i++) {
        //     if(trx.transactionSigners[i] == msg.sender) {
        //         revert("can't sign twice");
        //     }
        // }

        require(isValidSigner[msg.sender], "not a valid signer");
        require(!hasSigned[msg.sender][_txId], "can't sign twice");

        hasSigned[msg.sender][_txId] = true;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);

        if(trx.noOfApproval == quorum) {
            trx.isCompleted = true;
            IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
        }
    }

    function updateQuorum(uint8 _newQuorum) external {
        require(isValidSigner[msg.sender], "Only valid signers can update the quorum");
        require(_newQuorum > 1, "Quorum must be greater than 1");
        require(_newQuorum <= noOfValidSigners, "New quorum cannot be greater than the number of valid signers");

        uint256 _quorumUpdateId = quorumUpdateCount + 1;
        QuorumUpdate storage qUpdate = quorumUpdates[_quorumUpdateId];
        
        qUpdate.id = _quorumUpdateId;
        qUpdate.newQuorum = _newQuorum;
        qUpdate.noOfApproval = 1;
        qUpdate.signers.push(msg.sender);

        hasSignedQuorumUpdate[msg.sender][_quorumUpdateId] = true;
        quorumUpdateCount += 1;

        quorum = _newQuorum;
    }

    function approveQuorumUpdate(uint256 _quorumUpdateId) external {
        QuorumUpdate storage qUpdate = quorumUpdates[_quorumUpdateId];

        require(qUpdate.id != 0, "invalid quorum update id");
        require(!qUpdate.isCompleted, "quorum update already completed");
        require(qUpdate.noOfApproval < quorum, "quorum update already has enough approvals");

        require(isValidSigner[msg.sender], "not a valid signer");
        require(!hasSignedQuorumUpdate[msg.sender][_quorumUpdateId], "can't approve twice");

        hasSignedQuorumUpdate[msg.sender][_quorumUpdateId] = true;
        qUpdate.noOfApproval += 1;
        qUpdate.signers.push(msg.sender);

        if (qUpdate.noOfApproval == quorum) {
            quorum = qUpdate.newQuorum;
            qUpdate.isCompleted = true;
        }
    }
}