import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying VoteToken contract...");

  // Desplegamos el contrato
  const voteToken = await deploy("VoteToken", {
    from: deployer,
    log: true,
    args: [], // No se requieren argumentos en el constructor de VoteToken
  });

  console.log(`VoteToken deployed at: ${voteToken.address}`);
};

export default deployVoteToken;
deployVoteToken.tags = ["VoteToken"];