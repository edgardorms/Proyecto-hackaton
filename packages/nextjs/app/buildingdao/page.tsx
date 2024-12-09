"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const ownerManagementAbi = [
  {
    inputs: [
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
    ],
    name: "addOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "removeOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_to", type: "address" }],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "owners",
    outputs: [
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "address", name: "delegateTo", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Añadir nuevo ABI para votaciones
const proposalManagementAbi = [
  {
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_type", type: "uint8" },
      { name: "_callData", type: "bytes" },
    ],
    name: "createProposal",
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

interface BuildingInfo {
  buildingName: string;
  treasury: string;
  totalApartments: number;
}

// Simplificar la interfaz Owner
interface Owner {
  address: string;
  tokenId: number;
  isActive: boolean;
  delegateTo: string;
}

interface DaoStats {
  totalOwners: number;
  activeProposals: number;
}

const BuildingDashboard = () => {
  const { address } = useAccount();
  const { data: buildingDAOInfo } = useDeployedContractInfo("BuildingDAO");
  const [buildingInfo, setBuildingInfo] = useState<BuildingInfo>();
  const [daoStats, setDaoStats] = useState<DaoStats>();
  const [showNewProposalForm, setShowNewProposalForm] = useState(false);
  const { writeContract } = useWriteContract();

  // Mantener solo las lecturas esenciales
  const { data: buildingData } = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: buildingDAOInfo?.abi,
    functionName: "buildingInfo",
    query: {
      refetchInterval: 5000,
    },
  }) as { data: [string, string, bigint] };

  const { data: activeProposals } = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: buildingDAOInfo?.abi,
    functionName: "getActiveProposals",
    query: {
      refetchInterval: 5000,
    },
  }) as { data: any[] };

  // Añadir lectura del siguiente tokenId disponible
  const { data: nextTokenId } = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: [
      ...ownerManagementAbi,
      {
        inputs: [],
        name: "getNextTokenId",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getNextTokenId",
  });

  // Simplificar el efecto para actualizar stats
  useEffect(() => {
    if (buildingDAOInfo?.address && buildingData) {
      setDaoStats({
        totalOwners: Number(buildingData[2]), // Using total apartments as proxy for now
        activeProposals: activeProposals?.length || 0,
      });
    }
  }, [buildingDAOInfo?.address, activeProposals, buildingData]);

  // Mantener solo la función de crear propuesta
  const handleCreateProposal = async (title: string, description: string, proposalType: number) => {
    try {
      await writeContract({
        address: buildingDAOInfo?.address as `0x${string}`,
        abi: proposalManagementAbi,
        functionName: "createProposal",
        args: [title, description, proposalType, "0x"],
      });
      notification.success("Proposal created successfully");
      setShowNewProposalForm(false);
    } catch (error: any) {
      notification.error(`Failed to create proposal: ${error.message}`);
    }
  };

  // Añadir funciones para manipular owners
  const handleAddOwner = async (ownerAddress: string, tokenId: number) => {
    try {
      await writeContract({
        address: buildingDAOInfo?.address as `0x${string}`,
        abi: ownerManagementAbi,
        functionName: "addOwner",
        args: [ownerAddress as `0x${string}`, BigInt(tokenId)],
      });
      notification.success("Owner added successfully");
    } catch (error: any) {
      notification.error(`Failed to add owner: ${error.message}`);
    }
  };

  const handleRemoveOwner = async (ownerAddress: string) => {
    try {
      await writeContract({
        address: buildingDAOInfo?.address as `0x${string}`,
        abi: ownerManagementAbi,
        functionName: "removeOwner",
        args: [ownerAddress as `0x${string}`],
      });
      notification.success("Owner removed successfully");
    } catch (error: any) {
      console.log(error.message);
      notification.error(`Failed to remove owner: ${error.message}`);
    }
  };

  const handleDelegate = async (delegateAddress: string) => {
    try {
      await writeContract({
        address: buildingDAOInfo?.address as `0x${string}`,
        abi: ownerManagementAbi,
        functionName: "delegate",
        args: [delegateAddress as `0x${string}`],
      });
      notification.success("Successfully delegated voting power");
    } catch (error: any) {
      notification.error(`Failed to delegate: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat bg-base-100 shadow-xl rounded-box p-6">
          <div className="stat-title">Total Apartments</div>
          <div className="stat-value">{daoStats?.totalOwners || 0}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-box p-6">
          <div className="stat-title">Active Proposals</div>
          <div className="stat-value">{daoStats?.activeProposals || 0}</div>
        </div>
      </div>

      {/* Información del edificio */}
      <div className="bg-base-100 shadow-xl rounded-box p-6">
        <h2 className="text-2xl font-bold mb-4">Building Information</h2>
        {buildingData && Array.isArray(buildingData) && (
          <div className="space-y-2">
            <p>Name: {buildingData[0]}</p>
            <p>
              Treasury: <Address address={buildingData[1]} />
            </p>
          </div>
        )}
      </div>

      {/* Sección para crear propuesta */}
      <div className="bg-base-100 shadow-xl rounded-box p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Proposal</h2>
          <button className="btn btn-primary" onClick={() => setShowNewProposalForm(!showNewProposalForm)}>
            {showNewProposalForm ? "Cancel" : "New Proposal"}
          </button>
        </div>

        {showNewProposalForm && (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateProposal(
                formData.get("title") as string,
                formData.get("description") as string,
                parseInt(formData.get("type") as string),
              );
            }}
          >
            <input
              name="title"
              type="text"
              placeholder="Proposal Title"
              className="input input-bordered w-full"
              required
            />
            <textarea
              name="description"
              placeholder="Proposal Description"
              className="textarea textarea-bordered w-full"
              required
            />
            <select name="type" className="select select-bordered w-full" required>
              <option value="0">Minor Change</option>
              <option value="1">Moderate Change</option>
              <option value="2">Major Change</option>
            </select>
            <button type="submit" className="btn btn-primary w-full">
              Create Proposal
            </button>
          </form>
        )}
      </div>
      {/* Nueva sección para gestionar owners */}
      <div className="bg-base-100 shadow-xl rounded-box p-6">
        <h2 className="text-2xl font-bold mb-4">Owner Management</h2>

        {/* Add Owner Form */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Add New Owner</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Owner Address"
              className="input input-bordered flex-1"
              id="newOwnerAddress"
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                const addr = (document.getElementById("newOwnerAddress") as HTMLInputElement).value;
                handleAddOwner(addr, Number(nextTokenId || 1));
              }}
            >
              Add Owner
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Next Token ID: {nextTokenId?.toString() || "Loading..."}</p>
        </div>

        {/* Remove Owner Form */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Remove Owner</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Owner Address to Remove"
              className="input input-bordered flex-1"
              id="removeOwnerAddress"
            />
            <button
              className="btn btn-error"
              onClick={() => {
                const addr = (document.getElementById("removeOwnerAddress") as HTMLInputElement).value;
                handleRemoveOwner(addr);
              }}
            >
              Remove Owner
            </button>
          </div>
        </div>

        {/* Delegate Form */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Delegate Voting Power</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Delegate Address"
              className="input input-bordered flex-1"
              id="delegateAddress"
            />
            <button
              className="btn btn-secondary"
              onClick={() => {
                const addr = (document.getElementById("delegateAddress") as HTMLInputElement).value;
                handleDelegate(addr);
              }}
            >
              Delegate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingDashboard;
