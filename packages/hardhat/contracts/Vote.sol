// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./BuildingDAO.sol";

contract Vote {
    address public parentDao;
    BuildingDAO.ProposalType public proposal;

    string public title;
    string public description;

    uint256 public startTime;
    uint256 public endTime;
    uint256 public quorum;
    uint256 public requiredMajority; // Fixed spelling
    uint256 public yesVotes;
    uint256 public noVotes;
    address public creator;

    bool public executed;

    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter, bool inFavor);
    event ProposalExecuted();

    constructor(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _quorum,
        uint256 _requiredMajority,
        BuildingDAO.ProposalType _proposal,
        address _creator,
        address _parentDao
    ) {
        title = _title;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        quorum = _quorum;
        requiredMajority = _requiredMajority;
        proposal = _proposal;
        creator = _creator;
        parentDao = _parentDao; // Fixed casing
    }

    function vote(bool inFavor) external {
        require(block.timestamp >= startTime, "Voting not started");
        require(block.timestamp <= endTime, "Voting ended");
        
        require(!hasVoted[msg.sender], "Already voted");

        uint256 tokensOwned = BuildingDAO(parentDao).getOwnerTokens(msg.sender);
        require(tokensOwned > 0, "No tokens owned");

        hasVoted[msg.sender] = true;
        if (inFavor) {
            yesVotes += tokensOwned;
        } else {
            noVotes += tokensOwned;
        }

        emit Voted(msg.sender, inFavor);
    }

    function executeProposal() external {
        require(block.timestamp > endTime, "Voting ongoing");
        require(!executed, "Already executed");

        uint256 totalVotes = yesVotes + noVotes;
        require(totalVotes >= quorum, "Quorum not reached");

        if ((yesVotes * 100) / totalVotes >= requiredMajority) {
            executed = true;
            emit ProposalExecuted();
        }
    }
}