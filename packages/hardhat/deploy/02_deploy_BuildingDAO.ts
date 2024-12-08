import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployBuildingDAO: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n-------------------------------------");
  console.log("🏗 Deploying BuildingDAO contract...");
  console.log("Deployer address:", deployer);

  // Constructor parameters
  const buildingName = "Edificio Test";
  const totalApartments = 50;

  // Test addresses - using local network addresses
  const initialOwners = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x0AD49e5E66B949424b25572FC99d94d8bf35f575",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  ];

  // Using deployer as treasury for testing
  const treasury = deployer;

  try {
    // Validate addresses
    initialOwners.forEach((address, index) => {
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid owner address at index ${index}: ${address}`);
      }
    });

    if (!ethers.isAddress(treasury)) {
      throw new Error(`Invalid treasury address: ${treasury}`);
    }

    // Deploy BuildingDAO
    const buildingDAO = await deploy("BuildingDAO", {
      from: deployer,
      args: [buildingName, totalApartments, initialOwners, treasury],
      log: true,
      waitConfirmations: 1,
    });

    console.log("\n📝 BuildingDAO deployed to:", buildingDAO.address);
    console.log("Total Apartments:", totalApartments);
    console.log("Initial Owners:", initialOwners.length);
    console.log("-------------------------------------\n");

    // Verify contract on etherscan if not on localhost
    if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
      try {
        await hre.run("verify:verify", {
          address: buildingDAO.address,
          constructorArguments: [buildingName, totalApartments, initialOwners, treasury],
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

deployBuildingDAO.tags = ["BuildingDAO"];
export default deployBuildingDAO;
