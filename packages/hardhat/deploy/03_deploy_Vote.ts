// deploy/03_deploy_Vote.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVote: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get BuildingDAO deployment
  const BuildingDAO = await deployments.get("BuildingDAO");

  console.log("\n-------------------------------------");
  console.log("🗳️ Deploying Vote contract...");

  try {
    const vote = await deploy("Vote", {
      from: deployer,
      args: [
        "Test Proposal", // title
        "Test Description", // description
        Math.floor(Date.now() / 1000) + 3600, // startTime (1 hour from now)
        Math.floor(Date.now() / 1000) + 86400, // endTime (24 hours from now)
        25, // quorum (25%)
        51, // requiredMajority (51%)
        0, // ProposalType.MINOR_CHANGE
        deployer, // creator
        BuildingDAO.address, // parentDao
      ],
      log: true,
      waitConfirmations: 1,
    });

    console.log("\n📝 Vote contract deployed to:", vote.address);
    console.log("Parent DAO:", BuildingDAO.address);
    console.log("-------------------------------------\n");

    // Verify contract if not on localhost
    if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
      try {
        await hre.run("verify:verify", {
          address: vote.address,
          constructorArguments: [
            "Test Proposal",
            "Test Description",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 86400,
            25,
            51,
            0,
            deployer,
            BuildingDAO.address,
          ],
        });
        console.log("✅ Contract verified on Etherscan");
      } catch (error) {
        console.log("❌ Error verifying contract:", error);
      }
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
};

deployVote.tags = ["Vote"];
deployVote.dependencies = ["BuildingDAO"];

export default deployVote;
