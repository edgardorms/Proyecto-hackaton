// pages/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, getContract, http } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// pages/page.tsx

// pages/page.tsx

// pages/page.tsx

// pages/page.tsx

// pages/page.tsx

const hasAddressVotedAbi = [
  {
    inputs: [{ internalType: "address", name: "_voter", type: "address" }],
    name: "hasAddressVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const voteStatisticsAbi = [
  {
    inputs: [],
    name: "getVoteStatistics",
    outputs: [
      { name: "_yesVotes", type: "uint256" },
      { name: "_noVotes", type: "uint256" },
      { name: "_quorum", type: "uint256" },
      { name: "_requiredMajority", type: "uint256" },
      { name: "_hasEnded", type: "bool" },
      { name: "_quorumReached", type: "bool" },
      { name: "_majorityReached", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface Proposal {
  voteContract: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  yesVotes: number;
  noVotes: number;
  executed: boolean;
}

const ProposalCard = ({ proposal, buildingDAOInfo }: { proposal: Proposal; buildingDAOInfo: any }) => {
  const { address } = useAccount();
  const { data: hasVoted } = useReadContract({
    address: proposal.voteContract as `0x${string}`,
    abi: hasAddressVotedAbi,
    functionName: "hasAddressVoted",
    args: [address as `0x${string}`],
    query: {
      refetchInterval: 2000, // Refresca cada 2 segundos
    },
  });

  const totalVotes = proposal.yesVotes + proposal.noVotes;

  const { writeContract } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>();

  const handleVote = async (inFavor: boolean) => {
    try {
      setIsLoading(true);

      // Validate parameters
      console.log("Voting parameters:", {
        voteContract: proposal.voteContract,
        inFavor: inFavor,
        sender: buildingDAOInfo?.address,
      });

      // Pre-execution checks
      if (!proposal.voteContract) {
        throw new Error("Vote contract address is missing");
      }

      console.log("Starting vote transaction...");

      const tx = await writeContract({
        address: proposal.voteContract as `0x${string}`,
        abi: [
          {
            inputs: [
              {
                internalType: "bool",
                name: "inFavor",
                type: "bool",
              },
            ],
            name: "vote",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "vote",
        args: [inFavor],
      });

      console.log("Transaction submitted:", tx);
    } catch (error: any) {
      console.error("Vote execution error:", {
        message: error.message,
        error: error,
      });
      notification.error(`Error voting: ${error.message}`);
      setIsLoading(false);
    }
  };

  const [timeRemaining, setTimeRemaining] = useState("");

  const { data: voteStats } = useReadContract({
    address: proposal.voteContract as `0x${string}`,
    abi: voteStatisticsAbi,
    functionName: "getVoteStatistics",
    query: {
      refetchInterval: 2000, // Refresca cada 2 segundos
    },
  });

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      if (now >= proposal.endTime) {
        setTimeRemaining("Voting ended");
        return;
      }

      const remaining = proposal.endTime - now;
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, [proposal.endTime]);

  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-6 mb-6 font-sans">
      <h3 className="text-2xl font-bold mb-2 text-gray-900">{proposal.title}</h3>
      <p className="text-gray-800 mb-4">{proposal.description}</p>
      <p className="mb-2 font-semibold text-gray-900">Total Votes: {totalVotes}</p>
      {hasVoted ? (
        <p className="text-green-600 font-semibold">You have already voted.</p>
      ) : (
        <div className="flex gap-4 mt-4">
          <button onClick={() => handleVote(true)} disabled={isLoading} className="btn btn-success">
            {isLoading ? "Voting..." : "Vote Yes"}
          </button>
          <button onClick={() => handleVote(false)} disabled={isLoading} className="btn btn-error">
            Vote No
          </button>
        </div>
      )}
      {voteStats && (
        <div className="mt-6">
          <p className="mb-2 text-gray-900">
            Yes Votes: {Number(voteStats[0])} (
            {totalVotes > 0 ? ((Number(voteStats[0]) * 100) / totalVotes).toFixed(1) : 0}%)
          </p>
          <p className="mb-2 text-gray-900">
            No Votes: {Number(voteStats[1])} (
            {totalVotes > 0 ? ((Number(voteStats[1]) * 100) / totalVotes).toFixed(1) : 0}%)
          </p>
          <p className="mb-2 text-gray-900">
            Quorum Progress: {totalVotes}/{Number(voteStats[2])} votes needed
          </p>
          <p className="mb-4 text-gray-900">Required Majority: {Number(voteStats[3])}%</p>
          <p className="font-bold text-lg text-center mb-4 text-gray-900">{timeRemaining}</p>
          <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${(totalVotes / Number(voteStats[2])) * 100}%` }}
            ></div>
          </div>
          {voteStats[4] && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-xl font-semibold text-gray-900">
                Final Result:{" "}
                {voteStats[6] ? (
                  <span className="text-green-600">Proposal Passed</span>
                ) : (
                  <span className="text-red-600">Proposal Failed</span>
                )}
              </p>
              {!voteStats[5] && <p className="text-red-600 mt-2">Quorum not reached</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Votations() {
  // Changed from 'votations' to 'Votations'
  const { data: buildingDAOInfo } = useDeployedContractInfo("BuildingDAO");
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Get proposal count
  const { data: proposalCount } = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: buildingDAOInfo?.abi,
    functionName: "getProposalCount",
    query: {
      refetchInterval: 2000,
    },
  });

  // Create a single request for all proposals
  const { data: allProposals } = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: "getActiveProposals",
        outputs: [{ type: "address[]", name: "" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getActiveProposals",
    query: {
      refetchInterval: 2000,
    },
  });

  // Combine results
  useEffect(() => {
    if (!allProposals) return;

    const fetchProposalDetails = async () => {
      const publicClient = createPublicClient({
        chain: hardhat,
        transport: http(),
      });

      const proposalPromises = allProposals.map(async voteContract => {
        const contract = getContract({
          address: voteContract,
          abi: [
            { inputs: [], name: "title", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
            {
              inputs: [],
              name: "description",
              outputs: [{ type: "string" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "startTime",
              outputs: [{ type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            { inputs: [], name: "endTime", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
            { inputs: [], name: "yesVotes", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
            { inputs: [], name: "noVotes", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
            { inputs: [], name: "executed", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
          ],
          client: publicClient,
        });

        const [title, description, startTime, endTime, yesVotes, noVotes, executed] = await Promise.all([
          contract.read.title(),
          contract.read.description(),
          contract.read.startTime(),
          contract.read.endTime(),
          contract.read.yesVotes(),
          contract.read.noVotes(),
          contract.read.executed(),
        ]);

        return {
          voteContract,
          title,
          description,
          startTime: Number(startTime),
          endTime: Number(endTime),
          yesVotes: Number(yesVotes),
          noVotes: Number(noVotes),
          executed,
        };
      });

      const proposalDetails = await Promise.all(proposalPromises);
      setProposals(proposalDetails);
    };

    fetchProposalDetails();
  }, [allProposals]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Building DAO Proposals</h1>
        {proposals.map((proposal, index) => (
          <ProposalCard key={index} proposal={proposal} buildingDAOInfo={buildingDAOInfo} />
        ))}
      </div>
    </div>
  );
}
