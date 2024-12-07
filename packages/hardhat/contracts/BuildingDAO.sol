// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BuildingDAO {
    struct Building {
        uint256 totalApartments;
        uint256 totalTokens;
        string buildingName;
        address treasury;
    }

    struct Owner {
        uint256 tokensOwned;
        address delegateTo;
        bool isActive;
        mapping(uint256 => bool) votedProposals;
    }

    enum ProposalType {
        MINOR_CHANGE, // >50% mayoría, 25% quórum
        MODERATE_CHANGE, // >60% mayoría, 50% quórum
        MAJOR_CHANGE // >75% mayoría, 75% quórum
    }

    struct Proposal {
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 quorum;
        uint256 requiredMajority;
        bool executed;
        bool isActive;
        ProposalType proposalType;
        bytes callData; // Para ejecutar acciones automáticamente
        mapping(address => bool) voted;
    }

    Building public buildingInfo;
    address public admin;
    mapping(address => Owner) public owners;
    Proposal[] public proposals;
    uint256 public constant VOTING_DELAY = 1 days;
    uint256 public constant VOTING_PERIOD = 7 days;

    // Events
    event OwnerAdded(address indexed owner, uint256 tokens);
    event OwnerRemoved(address indexed owner);
    event TokensTransferred(address indexed from, address indexed to, uint256 tokens);
    event ProposalCreated(uint256 indexed proposalId, string title, ProposalType proposalType);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 tokens);
    event ProposalExecuted(uint256 indexed proposalId);
    event DelegationChanged(address indexed delegator, address indexed delegatee);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Solo el admin puede ejecutar esta funcion");
        _;
    }

    modifier onlyOwner() {
        require(owners[msg.sender].isActive, "Solo propietarios pueden ejecutar esta funcion");
        _;
    }

    constructor(
        string memory _buildingName,
        uint256 _totalApartments,
        address[] memory _initialOwners,
        uint256[] memory _tokenAmounts,
        address _treasury
    ) {
        require(_initialOwners.length == _tokenAmounts.length, "Arrays deben tener la misma longitud");
        require(_initialOwners.length > 0, "Debe haber al menos un propietario");
        
        admin = msg.sender;
        buildingInfo.buildingName = _buildingName;
        buildingInfo.totalApartments = _totalApartments;
        buildingInfo.treasury = _treasury;

        uint256 totalTokens;
        for(uint i = 0; i < _initialOwners.length; i++) {
            require(_initialOwners[i] != address(0), "Direccion invalida");
            owners[_initialOwners[i]].tokensOwned = _tokenAmounts[i];
            owners[_initialOwners[i]].isActive = true;
            totalTokens += _tokenAmounts[i];
            emit OwnerAdded(_initialOwners[i], _tokenAmounts[i]);
        }

        require(totalTokens == _totalApartments, "Total de tokens debe igual total de apartamentos");
        buildingInfo.totalTokens = totalTokens;
    }

    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _type,
        bytes memory _callData
    ) public onlyOwner returns (uint256) {
        require(owners[msg.sender].tokensOwned > 0, "Debe tener tokens para crear propuesta");

        uint256 proposalId = proposals.length;
        Proposal storage newProposal = proposals.push();
        
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.startTime = block.timestamp + VOTING_DELAY;
        newProposal.endTime = newProposal.startTime + VOTING_PERIOD;
        newProposal.isActive = true;
        newProposal.proposalType = _type;
        newProposal.callData = _callData;

        // Set quorum and majority based on proposal type
        if (_type == ProposalType.MINOR_CHANGE) {
            newProposal.quorum = (buildingInfo.totalTokens * 25) / 100;
            newProposal.requiredMajority = 50;
        } else if (_type == ProposalType.MODERATE_CHANGE) {
            newProposal.quorum = (buildingInfo.totalTokens * 50) / 100;
            newProposal.requiredMajority = 60;
        } else {
            newProposal.quorum = (buildingInfo.totalTokens * 75) / 100;
            newProposal.requiredMajority = 75;
        }

        emit ProposalCreated(proposalId, _title, _type);
        return proposalId;
    }

    function vote(uint256 _proposalId, bool _vote) public onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.startTime, "Votacion no ha comenzado");
        require(block.timestamp <= proposal.endTime, "Votacion ha terminado");
        require(proposal.isActive, "Propuesta no esta activa");
        require(!proposal.voted[msg.sender], "Ya has votado");

        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "No tienes poder de voto");

        proposal.voted[msg.sender] = true;
        
        if (_vote) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }

        emit VoteCast(msg.sender, _proposalId, _vote, votingPower);

        // Check if proposal can be executed
        if (canExecuteProposal(_proposalId)) {
            executeProposal(_proposalId);
        }
    }

    function delegate(address _to) public onlyOwner {
        require(_to != msg.sender, "No puedes delegarte a ti mismo");
        require(owners[_to].isActive || _to == address(0), "Delegado debe ser propietario activo o address(0)");
        
        owners[msg.sender].delegateTo = _to;
        emit DelegationChanged(msg.sender, _to);
    }

    function getVotingPower(address _owner) public view returns (uint256) {
        uint256 power = owners[_owner].tokensOwned;
        
        // Add delegated voting power
        for (address delegator = msg.sender; delegator != address(0);) {
            Owner storage delegatorInfo = owners[delegator];
            if (delegatorInfo.delegateTo == _owner) {
                power += delegatorInfo.tokensOwned;
            }
            delegator = delegatorInfo.delegateTo;
        }
        
        return power;
    }

    function canExecuteProposal(uint256 _proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.executed || !proposal.isActive) return false;
        
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes;
        if (totalVotes < proposal.quorum) return false;
        
        uint256 yesPercentage = (proposal.yesVotes * 100) / totalVotes;
        return yesPercentage >= proposal.requiredMajority;
    }

    function executeProposal(uint256 _proposalId) internal {
        Proposal storage proposal = proposals[_proposalId];
        require(canExecuteProposal(_proposalId), "Propuesta no puede ser ejecutada");
        
        proposal.executed = true;
        proposal.isActive = false;

        // Execute proposal's callData if any
        if (proposal.callData.length > 0) {
            (bool success, ) = buildingInfo.treasury.call(proposal.callData);
            require(success, "Ejecucion de propuesta fallo");
        }

        emit ProposalExecuted(_proposalId);
    }

    // Admin functions
    function addOwner(address _owner, uint256 _tokens) public onlyAdmin {
        require(!owners[_owner].isActive, "Propietario ya existe");
        require(_tokens > 0, "Tokens debe ser mayor a 0");
        
        owners[_owner].tokensOwned = _tokens;
        owners[_owner].isActive = true;
        buildingInfo.totalTokens += _tokens;
        
        emit OwnerAdded(_owner, _tokens);
    }

    function removeOwner(address _owner) public onlyAdmin {
        require(owners[_owner].isActive, "Propietario no existe");
        
        buildingInfo.totalTokens -= owners[_owner].tokensOwned;
        delete owners[_owner];
        
        emit OwnerRemoved(_owner);
    }

    // View functions
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }

    function getProposalDetails(uint256 _proposalId) public view returns (
        string memory title,
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        bool executed,
        ProposalType proposalType
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.isActive,
            proposal.executed,
            proposal.proposalType
        );
    }
}