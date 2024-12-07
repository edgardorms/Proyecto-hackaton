// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Vote {

addres public parentDao;
BuildingDao.ProposalType public proposaltype;

string public title;
string public description;

uint256 public startTime;
uint256 public endTime;
uint256 public quorum;
uint256 public requiredMayority;
uint256 public yesVotes;
uint256 public noVotes;
address public creator;

bool public executed;



mapping(address=>bool) public hasVoted;



event Voted(address indexed voter, bool inFavor);
event ProposalExecuted();


constructor(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _quorum,
        uint256 _requiredMajority,
        BuildingDAO.ProposalType _proposalType,
        address _creator,
        address _parentDAO)
     {
        title = _title;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        quorum = _quorum;
        requiredMajority = _requiredMajority;
        proposalType = _proposalType;
        creator = _creator;
        parentDAO = _parentDAO;
    }

    function vote(bool inFavor) external {
        require(block.timestamp >= startTime, "Voting not started");
        require(block.timestamp <= endTime, "Voting ended");
        require(!hasVoted[msg.sender], "Already voted");

        // Lógica para verificar elegibilidad desde BuildingDAO.
        uint256 tokensOwned = BuildingDAO(parentDAO).getOwnerTokens(msg.sender);
        require(tokensOwned <= 0, "No tokens owned");

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
            // Lógica para ejecutar la acción propuesta.
            emit ProposalExecuted();
        }
    }
}
