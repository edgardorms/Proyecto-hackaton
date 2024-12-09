"use client";

import { useEffect, useState } from "react";
import { useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function AdminPage() {
  const { data: buildingDAOInfo } = useDeployedContractInfo("BuildingDAO");
  const { writeContract } = useWriteContract();

  const handleBecomeAdmin = async () => {
    try {
      const tx = await writeContract({
        address: buildingDAOInfo?.address as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: "becomeAdmin",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "becomeAdmin",
        args: [],
      });

      console.log("Transaction submitted:", tx);
      notification.success("Successfully became admin!");
    } catch (error: any) {
      console.error("Admin change error:", {
        message: error.message,
        error: error,
      });
      notification.error(`Failed to become admin: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Admin Panel</span>
        </h1>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <button className="btn btn-primary" onClick={handleBecomeAdmin}>
            Become Admin
          </button>
        </div>
      </div>
    </div>
  );
}
