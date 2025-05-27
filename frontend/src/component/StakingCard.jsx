import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  CONTRACT_ADDRESSES,
  ERC20Abi,
  stakingPoolAbi,
} from "../utils/constants";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Spinner } from "./Spinner";
import {parseUnits, formatUnits} from 'viem'


const StakingCard = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");

  const stakingPoolAddress = CONTRACT_ADDRESSES.stakingPool;
  const stakerTokenAddress = CONTRACT_ADDRESSES.stakerToken;
  const rewarderTokenAddress = CONTRACT_ADDRESSES.rewarderToken;
  const tokenDecimals = 18;

  // Reading user's staking token balance
  // STaking token is named as STakerToken
  const { data: stBalance, refetch: refetchStBalance } = useReadContract({
    address: stakerTokenAddress,
    abi:ERC20Abi,
    functionName: "balanceOf",
    args: [userAddress],
    query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
  });

//   const {data: rtBalance, refetch: refetchRtBalance} = useReadContract({
//     address: rewarderTokenAddress,
//     abi:ERC20Abi,
//     functionName: 'balanceOf',
//     agrs:[userAddress],
//     query: {enabled: isConected && !!userAddress,
//         refetchInterval: 5000},
//   });

  const { data: stakedSt, refetch: refetchStakedSt } = useReadContract({
  address: stakingPoolAddress,
    abi: stakingPoolAbi,
    functionName: "stakedAmounts",
    args: [userAddress],
    query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
  });

  const { data: pendingRewards, refetch: refetchPendingRewards } =
    useReadContract({
      address: stakingPoolAddress,
      abi: stakingPoolAbi,
      functionName: "getPendingRewards",
      args: [userAddress],
      query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
    });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stakerTokenAddress,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [userAddress, stakingPoolAddress],
    query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
  });

  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeStake, data: stakeHash } = useWriteContract();
  const { writeContract: writeUnstake, data: unstakeHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isStaking, isSuccess: isStakeSuccess } =
    useWaitForTransactionReceipt({ hash: stakeHash });
  const { isLoading: isUnstaking, isSuccess: isUnstakeSuccess } =
    useWaitForTransactionReceipt({ hash: unstakeHash });
  const { isLoading: isClaiming, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({ hash: claimHash });

  useEffect(() => {
    if (isApproveSuccess) {
      toast.success("Approval Successful");
      refetchAllowance();
      refetchAllowance();
    }

    if (isStakeSuccess) {
      toast.success("Staking Successful");
      setStakeAmount("");
      refetchStBalance();
      refetchStakedSt();
      refetchPendingRewards();
    }

    if (isUnstakeSuccess) {
      toast.success("UnStaking Successful");
      setStakeAmount("");
      refetchStBalance();
      refetchStakedSt();
      refetchPendingRewards();
    }

    if (isClaimSuccess) {
      toast.success("Rewards Claimed Successfully");
      refetchStBalance();
      refetchPendingRewards();
    }
  }, [
    isApproveSuccess,
    isStakeSuccess,
    isUnstakeSuccess,
    isClaimSuccess,
    refetchAllowance,
    refetchStBalance,
    refetchStakedSt,
    refetchPendingRewards,
  ]);

  const handleApprove = async () => {
    if (!userAddress || !stakerTokenAddress) return;

    try {
      await writeApprove({
        address: stakerTokenAddress,
        abi: ERC20Abi,
        functionName: "approve",
        args: [stakingPoolAddress, parseUnits("1000000000", tokenDecimals)],
      });
      toast.success("Approved Successfully");
    } catch (error) {
      toast.error(`Approval failed ${error.shortMessage || error.message}`);
    }
  };

  const handleStake = async () => {
    if (!userAddress || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please Enter a valid amount to stake");
      return;
    }
    try {
      const amountWei = parseUnits(stakeAmount, tokenDecimals);
      if (stBalance !== undefined && amountWei > stBalance) {
        toast.error("Insufficient Balance");
        return;
      }
      if (allowance !== undefined && amountWei > allowance) {
        toast.error(
          "Pleae approve the staking contract to spend enough Staker Token first"
        );
        return;
      }

      await writeStake({
        address: stakingPoolAddress,
        abi: stakingPoolAbi,
        functionName: "stake",
        args: [amountWei],
      });
      toast.success("Token Staked Successfully");
    } catch (error) {
      toast.error(`Staking failed :: ${error.shortMessage || error.message} `);
    }
  };

  const handleUnstake = async () => {
    if (!userAddress || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter valid ");
      return;
    }
    try {
      const amountWei = parseUnits(stakeAmount, tokenDecimals);
      if (stakedSt !== undefined && amountWei > stakedSt) {
        toast.error("Not enough Staker tokens to stake");
      }
      await writeUnstake({
        address: stakingPoolAddress,
        abi: stakingPoolAbi,
        functionName: "unstake",
        args: [amountWei],
      });
      toast.success("Token Unstaked Successfully");
    } catch (error) {
      toast.error(`Unstaking Failed :: ${error.shortMessage || error.message}`);
    }
  };

  const handleClaim = async () => {
    if (!userAddress) return;
    try {
      if (pendingRewards === undefined || pendingRewards === 0n) {
        toast.error("No rewards to claim");
      }
      await writeClaim({
        address: stakingPoolAddress,
        abi: stakingPoolAbi,
        functionName: "claimRewards",
      });
      toast.success("Rewards Claimed Successfully");
    } catch (error) {
      toast.error(
        `Claiming Rewards failed :: ${error.shortMessage || error.message}`
      );
    }
  };

  const hashApproved =
    allowance != undefined && stBalance !== undefined && allowance >= stBalance;

  return (
   <div className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden backdrop-blur-md bg-gray-900/40 border border-gray-700/30 shadow-2xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-shadow duration-500">
  {/* Header with dynamic light */}
  <div className="relative p-5 sm:p-6 border-b border-gray-700/40 overflow-hidden">
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full filter blur-[60px]"></div>
    <h2 className="text-xl sm:text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 relative z-10">
      STK Token Staking
    </h2>
  </div>

  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
    {isConnected ? (
      <>
        {/* Stats Grid - Responsive layout */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Your Balance", value: stBalance, unit: "STK" },
            { label: "Staked", value: stakedSt, unit: "STK" },
            { label: "Rewards", value: pendingRewards, unit: "RTK" }
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-gray-800/20 hover:bg-gray-800/30 p-3 rounded-lg border border-gray-700/20 transition-all duration-300"
            >
              <p className="text-xs xs:text-[0.7rem] sm:text-xs text-gray-400 mb-1 truncate">{item.label}</p>
              <div className="flex items-baseline">
                <div className="text-base sm:text-lg font-medium text-white truncate">
                  {item.value !== undefined ? (
                    formatUnits(item.value, tokenDecimals)
                  ) : (
                    <Spinner size="xs" className="inline-block" />
                  )}
                </div>
                <span className="text-[0.6rem] xs:text-xs text-gray-400 ml-1">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Approval Button - Full width on mobile */}
        {!hashApproved && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-400/90 to-orange-500/90 hover:from-amber-500 hover:to-orange-600 text-white text-sm sm:text-base font-medium rounded-xl shadow-md transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              {isApproving ? (
                <>
                  <Spinner size="xs" className="mr-2" />
                  <span className="hidden xs:inline">Approving...</span>
                  <span className="xs:hidden">Processing...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Approve STK</span>
                  <span className="sm:hidden">Approve</span>
                </>
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        )}

        {/* Input Section - Optimized for touch */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm text-gray-300">Amount (STK)</label>
            <button 
              onClick={() => stBalance && setStakeAmount(formatUnits(stBalance, tokenDecimals))}
              className="text-[0.6rem] xs:text-xs bg-gray-700/30 hover:bg-gray-700/50 px-2 py-1 rounded text-blue-300 transition-colors"
            >
              Max
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons - Stack on small screens */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={handleStake}
            disabled={!hashApproved || isStaking || isApproving || parseFloat(stakeAmount) <= 0}
            className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-400/90 to-emerald-500/90 hover:from-green-500 hover:to-emerald-600 text-white text-sm sm:text-base font-medium rounded-xl shadow-md transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              {isStaking ? (
                <>
                  <Spinner size="xs" className="mr-2" />
                  <span className="hidden xs:inline">Staking...</span>
                  <span className="xs:hidden">Processing...</span>
                </>
              ) : (
                "Stake"
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>

          <button
            onClick={handleUnstake}
            disabled={isUnstaking || parseFloat(stakeAmount) <= 0}
            className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-400/90 to-red-500/90 hover:from-orange-500 hover:to-red-600 text-white text-sm sm:text-base font-medium rounded-xl shadow-md transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              {isUnstaking ? (
                <>
                  <Spinner size="xs" className="mr-2" />
                  <span className="hidden xs:inline">Unstaking...</span>
                  <span className="xs:hidden">Processing...</span>
                </>
              ) : (
                "Unstake"
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>

        {/* Claim Button - Responsive text */}
        <button
          onClick={handleClaim}
          disabled={isClaiming || pendingRewards === 0n}
          className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-400/90 to-indigo-500/90 hover:from-blue-500 hover:to-indigo-600 text-white text-sm sm:text-base font-medium rounded-xl shadow-md transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center">
            {isClaiming ? (
              <>
                <Spinner size="xs" className="mr-2" />
                <span className="hidden sm:inline">Claiming...</span>
                <span className="sm:hidden">Processing...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Claim Rewards</span>
                <span className="sm:hidden">Claim</span>
                {pendingRewards !== undefined && (
                  <span className="ml-1 text-xs sm:text-sm font-normal opacity-90">
                    ({formatUnits(pendingRewards, tokenDecimals)} RTK)
                  </span>
                )}
              </>
            )}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
        </button>
      </>
    ) : (
      <div className="text-center p-5 sm:p-6 rounded-xl bg-gray-800/20 border border-gray-700/30">
        <p className="text-sm sm:text-base text-gray-300 mb-3">Connect wallet to stake tokens</p>
        <div className="inline-flex items-center px-4 py-2 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs sm:text-sm text-gray-300">Wallet Disconnected</span>
        </div>
      </div>
    )}
  </div>
</div>
  );
};

export default StakingCard;
