import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVote: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying Vote contract...");

  // Parámetros para el constructor
  const title = "Example Proposal Title";
  const description = "This is a description of the proposal.";
  const startTime = Math.floor(Date.now() / 1000); // Hora actual en segundos
  const endTime = startTime + 7 * 24 * 60 * 60; // 7 días después
  const quorum = ethers.utils.parseEther("100"); // Ejemplo: 100 tokens
  const requiredMajority = 60; // 60% de mayoría requerida
  const proposalType = 1; // Enum: 0 = MINOR_CHANGE, 1 = MODERATE_CHANGE, 2 = MAJOR_CHANGE
  const creator = deployer; // El deployer será el creador
  const parentDao = "ADDRESS BuildingDAO.sol"; // Dirección del contrato BuildingDAO

  // Desplegar contrato Vote
  const vote = await deploy("Vote", {
    from: deployer,
    log: true,
    args: [
      title,
      description,
      startTime,
      endTime,
      quorum,
      requiredMajority,
      proposalType,
      creator,
      parentDao,
    ],
  });

  console.log(`Vote deployed to: ${vote.address}`);
};

export default deployVote;
deployVote.tags = ["Vote"];