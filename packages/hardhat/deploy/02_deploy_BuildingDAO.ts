import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployBuildingDAO: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying BuildingDAO contract...");

  // Parámetros del constructor
  const buildingName = "Edificio Test"; // Nombre del edificio
  const totalApartments = 50; // Número total de apartamentos
  const initialOwners = [
    //direcciones de pureba de la red local//
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  ]; // Direcciones de los propietarios iniciales

  const treasury = "Address tesoreria "; // Dirección de la tesorería

  // Desplegar contrato BuildingDAO
  const buildingDAO = await deploy("BuildingDAO", {
    from: deployer,
    log: true,
    args: [buildingName, totalApartments, initialOwners, treasury],
  });

  console.log(`BuildingDAO deployed to: ${buildingDAO.address}`);
};

export default deployBuildingDAO;
deployBuildingDAO.tags = ["BuildingDAO"];

