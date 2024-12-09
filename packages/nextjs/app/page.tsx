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

export default function Home() {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Building DAO</h1>
      </div>
    </div>
  );
}
