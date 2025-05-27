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
import {toast} from "react-hot-toast";
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
    //   toast.success("Approved Successfully");
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
    //   toast.success("Token Staked Successfully");
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
    //   toast.success("Token Unstaked Successfully");
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
    //   toast.success("Rewards Claimed Successfully");
    } catch (error) {
      toast.error(
        `Claiming Rewards failed :: ${error.shortMessage || error.message}`
      );
    }
  };

  const hashApproved =
    allowance != undefined && stBalance !== undefined && allowance >= stBalance;

  return (
 

    <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden backdrop-blur-lg bg-gray-900/40 border border-gray-700/50 shadow-2xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all duration-300">
  {/* Header */}
  <div className="relative p-6 border-b border-gray-700/40 overflow-hidden">
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full filter blur-[60px]"></div>
    <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
      STK Token Staking
    </h2>
  </div>

  <div className="p-6 space-y-6">
    {isConnected ? (
      <>
        {/* Stats Section - Responsive layout */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Balance Card - Grows to fill space */}
          <div className="flex-1 bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 hover:bg-gray-800/40 transition-colors">
            <p className="text-sm text-gray-400 mb-2">Your Balance</p>
            <div className="flex items-end justify-between">
              <div className="min-w-0">
                <p className="text-2xl font-semibold text-white truncate">
                  {stBalance !== undefined ? (
                    formatUnits(stBalance, tokenDecimals)
                  ) : (
                    <Spinner size="sm" />
                  )}
                </p>
              </div>
              <span className="text-sm text-gray-400 ml-2 whitespace-nowrap">STK</span>
            </div>
          </div>

          {/* Staked Card - Grows to fill space */}
          <div className="flex-1 bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 hover:bg-gray-800/40 transition-colors">
            <p className="text-sm text-gray-400 mb-2">Staked</p>
            <div className="flex items-end justify-between">
              <div className="min-w-0">
                <p className="text-2xl font-semibold text-white truncate">
                  {stakedSt !== undefined ? (
                    formatUnits(stakedSt, tokenDecimals)
                  ) : (
                    <Spinner size="sm" />
                  )}
                </p>
              </div>
              <span className="text-sm text-gray-400 ml-2 whitespace-nowrap">STK</span>
            </div>
          </div>

          {/* Rewards Card - Fixed width on desktop */}
          <div className="sm:w-48 bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 hover:bg-gray-800/40 transition-colors">
            <p className="text-sm text-gray-400 mb-2">Pending Rewards</p>
            <div className="flex items-end justify-between">
              <div className="min-w-0">
                <p className="text-2xl font-semibold text-white truncate">
                  {pendingRewards !== undefined ? (
                    formatUnits(pendingRewards, tokenDecimals)
                  ) : (
                    <Spinner size="sm" />
                  )}
                </p>
              </div>
              <span className="text-sm text-gray-400 ml-2 whitespace-nowrap">RTK</span>
            </div>
          </div>
        </div>

        {/* Approval Button */}
        {!hashApproved && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
          >
            {isApproving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Approving...
              </>
            ) : (
              "Approve STK"
            )}
          </button>
        )}

        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Amount to Stake/Unstake</label>
            <button 
              onClick={() => stBalance && setStakeAmount(formatUnits(stBalance, tokenDecimals))}
              className="text-xs bg-gray-700/40 hover:bg-gray-700/60 px-2 py-1 rounded text-blue-300 transition-colors"
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
              className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-lg"
            />
            <span className="absolute right-4 top-3.5 text-sm text-gray-400">STK</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleStake}
            disabled={!hashApproved || isStaking || isApproving || parseFloat(stakeAmount) <= 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
          >
            {isStaking ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Staking...
              </>
            ) : (
              "Stake"
            )}
          </button>

          <button
            onClick={handleUnstake}
            disabled={isUnstaking || parseFloat(stakeAmount) <= 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
          >
            {isUnstaking ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Unstaking...
              </>
            ) : (
              "Unstake"
            )}
          </button>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={isClaiming || pendingRewards === 0n}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
        >
          {isClaiming ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Claiming...
            </>
          ) : (
            `Claim ${pendingRewards !== undefined ? formatUnits(pendingRewards, tokenDecimals) : '0'} RTK`
          )}
        </button>
      </>
    ) : (
      <div className="text-center p-8 rounded-xl bg-gray-800/30 border border-gray-700/30">
        <p className="text-gray-300 mb-4">Connect your wallet to stake tokens</p>
        <div className="inline-flex items-center px-4 py-2 bg-gray-700/40 rounded-lg border border-gray-600/30">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm text-gray-300">Wallet Disconnected</span>
        </div>
      </div>
    )}
  </div>
</div>
  );
};

export default StakingCard;
