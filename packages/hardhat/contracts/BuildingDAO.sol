// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./voteToken.sol";
import "./Vote.sol";

contract BuildingDAO {
    struct Building {
        string buildingName;
        address treasury;
        uint256 totalApartments;
    }

    struct Owner {
        bool isActive;
        address delegateTo;
    }

    enum ProposalType {
        MINOR_CHANGE,
        MODERATE_CHANGE,
        MAJOR_CHANGE
    }

    Building public buildingInfo;
    address public admin;
    VoteToken public voteToken;
    mapping(address => Owner) public owners;
    mapping(uint256 => address) public proposalVotes; // proposalId => Vote contract
    uint256 public proposalCount;
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant VOTING_PERIOD = 7 days;

    event ProposalCreated(uint256 indexed proposalId, address voteContract);
    event OwnerAdded(address indexed owner, uint256 tokenId);
    event OwnerRemoved(address indexed owner, uint256 tokenId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Solo admin");
        _;
    }

    modifier onlyOwner() {
        require(owners[msg.sender].isActive, "Solo propietarios");
        _;
    }

    constructor(
        string memory _buildingName,
        uint256 _totalApartments,
        address[] memory _initialOwners,
        address _treasury
    ) {
        admin = msg.sender;
        buildingInfo.buildingName = _buildingName;
        buildingInfo.totalApartments = _totalApartments;
        buildingInfo.treasury = _treasury;

        // Deploy VoteToken
        voteToken = new VoteToken();

        // Mint tokens for initial owners
        for(uint i = 0; i < _initialOwners.length; i++) {
            require(_initialOwners[i] != address(0), "Direccion invalida");
            owners[_initialOwners[i]].isActive = true;
            voteToken.mint(_initialOwners[i], i + 1); // tokenId starts from 1
            emit OwnerAdded(_initialOwners[i], i + 1);
        }
    }

    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _type,
        bytes memory _callData
    ) public onlyOwner returns (uint256) {
        require(voteToken.balanceOf(msg.sender) > 0, "No tokens");

        uint256 startTime = block.timestamp + VOTING_DELAY;
        uint256 endTime = startTime + VOTING_PERIOD;
        uint256 quorum;
        uint256 requiredMajority;

        if (_type == ProposalType.MINOR_CHANGE) {
            quorum = (buildingInfo.totalApartments * 25) / 100;
            requiredMajority = 50;
        } else if (_type == ProposalType.MODERATE_CHANGE) {
            quorum = (buildingInfo.totalApartments * 50) / 100;
            requiredMajority = 60;
        } else {
            quorum = (buildingInfo.totalApartments * 75) / 100;
            requiredMajority = 75;
        }

        Vote newVote = new Vote(
            _title,
            _description,
            startTime,
            endTime,
            quorum,
            requiredMajority,
            _type,
            msg.sender,
            address(this)
        );

        uint256 proposalId = proposalCount++;
        proposalVotes[proposalId] = address(newVote);

        emit ProposalCreated(proposalId, address(newVote));
        return proposalId;
    }

    function getOwnerTokens(address _owner) external view returns (uint256) {
        return voteToken.balanceOf(_owner);
    }

    function addOwner(address _owner, uint256 _tokenId) public onlyAdmin {
        require(!owners[_owner].isActive, "Ya es propietario");
        owners[_owner].isActive = true;
        voteToken.mint(_owner, _tokenId);
        emit OwnerAdded(_owner, _tokenId);
    }

    function removeOwner(address _owner) public onlyAdmin {
        require(owners[_owner].isActive, "No es propietario");
        uint256 tokenId = voteToken.tokenOfOwnerByIndex(_owner, 0);
        voteToken.burn(tokenId);
        delete owners[_owner];
        emit OwnerRemoved(_owner, tokenId);
    }

    function delegate(address _to) public onlyOwner {
        require(_to != msg.sender, "No auto-delegacion");
        require(owners[_to].isActive || _to == address(0), "Delegado invalido");
        owners[msg.sender].delegateTo = _to;
    }

    function getVotingPower(address _owner) public view returns (uint256) {
        uint256 ownPower = voteToken.balanceOf(_owner);
        
        // Add delegated power
        for (address delegator = msg.sender; delegator != address(0);) {
            if (owners[delegator].delegateTo == _owner) {
                ownPower += voteToken.balanceOf(delegator);
            }
            delegator = owners[delegator].delegateTo;
        }
        
        return ownPower;
    }
}