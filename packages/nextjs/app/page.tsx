// pages/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

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
  // Update to use the same pattern as other contract reads
  const { address } = useAccount();
  const { data: hasVoted } = useReadContract({
    address: proposal.voteContract as `0x${string}`,
    abi: hasAddressVotedAbi,
    functionName: "hasAddressVoted",
    args: [address as `0x${string}`],
  });
  console.log(hasVoted);

  const totalVotes = proposal.yesVotes + proposal.noVotes;

  const { writeContract, isSuccess, isError, isPending, error } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
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

      if (isSuccess) {
        notification.success("Vote submitted successfully");
      }
      if (isError) {
        console.error("Vote error:", error);
        notification.error(`Failed to submit vote: ${error?.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Vote execution error:", {
        message: error.message,
        error: error,
      });
      notification.error(`Error voting: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 pt-4 pb-4 mb-4">
      <h3>{proposal.title}</h3>
      <p>{proposal.description}</p>
      <p>Total Votes: {totalVotes}</p>
      {hasVoted ? (
        <p>You have already voted.</p>
      ) : (
        <div className="flex gap-4 mt-4">
          <button onClick={() => handleVote(true)} disabled={isLoading}>
            Vote Yes
          </button>
          <button onClick={() => handleVote(false)} disabled={isLoading}>
            Vote No
          </button>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const { data: buildingDAOInfo } = useDeployedContractInfo("BuildingDAO");
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Get proposal count
  const { data: proposalCount } = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: buildingDAOInfo?.abi,
    functionName: "getProposalCount",
    //  watch: true,
  });

  // Create fixed number of hooks (e.g., max 10 proposals)
  const proposal0 = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: buildingDAOInfo?.abi,
    functionName: "getProposalDetails",
    args: [0n],
    //enabled: Boolean(proposalCount && Number(proposalCount) > 0),
  });

  const proposal1 = useReadContract({
    address: buildingDAOInfo?.address as `0x${string}`,
    abi: buildingDAOInfo?.abi,
    functionName: "getProposalDetails",
    args: [1n],
    // enabled: Boolean(proposalCount && Number(proposalCount) > 1),
  });

  // Add more as needed...

  // Combine results
  useEffect(() => {
    if (!proposalCount) return;

    const proposalResults = [proposal0.data, proposal1.data].slice(0, Number(proposalCount)).filter(Boolean);

    type ProposalResult = readonly [string, string, string, bigint, bigint, bigint, bigint, boolean];

    const validProposals = proposalResults
      .filter((result): result is ProposalResult => !!result)
      .map(
        (result: ProposalResult): Proposal => ({
          voteContract: result[0],
          title: result[1],
          description: result[2],
          startTime: Number(result[3]),
          endTime: Number(result[4]),
          yesVotes: Number(result[5]),
          noVotes: Number(result[6]),
          executed: result[7],
        }),
      );

    setProposals(validProposals);
  }, [proposalCount, proposal0.data, proposal1.data]);

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
