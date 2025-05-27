import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  CONTRACT_ADDRESSES,
  ERC20Abi,
  multiTokenStakingPoolAbi,
} from "../utils/constants";
import {toast} from "react-hot-toast";
import { parseUnits, formatUnits } from "viem";
import { Spinner } from "./Spinner";
import { useEffect } from "react";
import { useState } from "react";

const supportedStakingTokens = [
  {
    name: "DAI SEPOLIA",
    symbol: "DAI",
    address: CONTRACT_ADDRESSES.sepoliaDAI,
    decimals: 18,
  },
  {
    name: "USDC SEPOLIA",
    symbol: "USDC",
    address: CONTRACT_ADDRESSES.sepoliaUSDC,
    decimals: 18,
  },
];

const MultipleStakingCard = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState(supportedStakingTokens[0]);
  const [stakeAmount, setStakeAmount] = useState("");

  const multiTokenStakingPoolAddress = CONTRACT_ADDRESSES.multiTokenStakingPool;
  const rewardTokenDecimals = 18;

  // Reading Selected Token Balances
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: [userAddress],
    query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
  });

  const { data: stakedTokenAmount, refetch: refetchStakedTokenAmount } =
    useReadContract({
      address: multiTokenStakingPoolAddress,
      abi: multiTokenStakingPoolAbi,
      functionName: "stakedAmounts",
      args: [selectedToken.address, userAddress],
      query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
    });

  const { data: pendingRewards, refetch: refetchPendingRewards } =
    useReadContract({
      address: multiTokenStakingPoolAddress,
      abi: multiTokenStakingPoolAbi,
      functionName: "getPendingRewards",
      args: [userAddress,selectedToken.address],
      query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
    });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [userAddress, multiTokenStakingPoolAddress],
    query: { enabled: isConnected && !!userAddress, refetchInterval: 5000 },
  });

  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeStake, data: stakeHash } = useWriteContract();
  const { writeContract: writeUnstake, data: unstakeHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });
  const { isLoading: isStaking, isSuccess: isStakeSuccess } =
    useWaitForTransactionReceipt({
      hash: stakeHash,
    });
  const { isLoading: isUnstaking, isSuccess: isUnstakeSuccess } =
    useWaitForTransactionReceipt({
      hash: unstakeHash,
    });
  const { isLoading: isClaiming, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  useEffect(() => {
    if (isApproveSuccess) {
      toast.success("Approval Successful");
      refetchAllowance();
    }
    if (isStakeSuccess) {
      toast.success("Staking Successful");
      setStakeAmount("");
      refetchTokenBalance();
      refetchStakedTokenAmount();
      refetchPendingRewards();
    }
    if (isUnstakeSuccess) {
      toast.success("Unstaking successful");
      setStakeAmount("");
      refetchTokenBalance();
      refetchStakedTokenAmount();
      refetchPendingRewards();
    }

    if (isClaimSuccess) {
      toast.success("Rewards Claimed Successfully");
      refetchPendingRewards();
    }
  }, [
    isApproveSuccess,
    isStakeSuccess,
    isUnstakeSuccess,
    isClaimSuccess,
    refetchAllowance,
    refetchTokenBalance,
    refetchStakedTokenAmount,
    refetchPendingRewards,
  ]);

  const handleApprove = async () => {
    if (!userAddress) return;
    try {
      await writeApprove({
        address: selectedToken.address,
        abi: ERC20Abi,
        functionName: "approve",
        args: [
          multiTokenStakingPoolAddress,
          parseUnits("1000000000", selectedToken.decimals),
        ],
      });
    } catch (error) {
      toast.error(`Approval failed : ${error.shortMessage || error.message}`);
    }
  };

  const handleStake = async () => {
    if (!userAddress || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount to stake");
      return;
    }
    try {
      const amountWei = parseUnits(stakeAmount, selectedToken.decimals);
      if (tokenBalance !== undefined && amountWei > tokenBalance) {
        toast.error(`Insufficient ${selectedToken.symbol} balance.`);
        return;
      }
      if (allowance !== undefined && amountWei > allowance) {
        toast.error(
          `Please approve the staking contract to spend enough ${selectedToken.symbol} first`
        );
        return;
      }
      await writeStake({
        address: multiTokenStakingPoolAddress,
        abi: multiTokenStakingPoolAbi,
        functionName: "stake",
        args: [selectedToken.address, amountWei],
      });
    } catch (error) {
      toast.error(`Staking failed :: ${error.shortMessage || error.message}`);
    }
  };

  const handleUnstake = async () => {
    if (!userAddress || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount to unstake");
      return;
    }
    try {
      const amountWei = parseUnits(stakeAmount, selectedToken.decimals);
      if (stakedTokenAmount !== undefined && amountWei > stakedTokenAmount) {
        toast.error(`Not enough ${selectedToken.symbol} staked.`);
        return;
      }
      await writeUnstake({
        address: multiTokenStakingPoolAddress,
        abi: multiTokenStakingPoolAbi,
        functionName: "unstake",
        args: [selectedToken.address, amountWei],
      });
    } catch (error) {
      toast.error(`Unstaking Failed :: ${error.shortMessage || error.message}`);
    }
  };

  const handleClaim = async () => {
    if (!userAddress) return;
    try {
      if (pendingRewards === undefined || pendingRewards === 0n) {
        toast.error("No rewards to claim");
        return;
      }
      await writeClaim({
        address: multiTokenStakingPoolAddress,
        abi: multiTokenStakingPoolAbi,
        functionName: "claimRewards",
        args: [selectedToken.address],
      });
    } catch (error) {
      toast.error(`Claiming Failed : ${error.shortMessage || error.message}`);
    }
  };

  const hasApproved =
    allowance !== undefined &&
    tokenBalance !== undefined &&
    allowance >= tokenBalance;

  return (
  <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden backdrop-blur-lg bg-gradient-to-br from-gray-900/60 to-gray-800/50 border border-gray-700/30 shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all duration-300 relative">
      {/* Header */}
      <div className="relative p-5 border-b border-gray-700/40">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full filter blur-[60px] z-0"></div>
        <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
          Multi-Token Staking
        </h2>
        <p className="text-center text-blue-300/80 text-sm mt-1">Earn RTK rewards</p>
      </div>

      <div className="p-5 space-y-5">
        {isConnected ? (
          <>
            {/* Token Selector */}
            <div className="relative">
              <select
                value={selectedToken.address}
                onChange={(e) =>
                  setSelectedToken(
                    supportedStakingTokens.find(
                      (t) => t.address === e.target.value
                    ) || supportedStakingTokens[0]
                  )
                }
                className="w-full px-4 py-3 backdrop-blur-sm bg-gray-800/50 border border-gray-700/40 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              >
                {supportedStakingTokens.map((token) => (
                  <option key={token.address} value={token.address} className="bg-gray-800 text-white">
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Stats Section - Updated for mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <p className="text-xs text-gray-400 mb-1">Your Balance</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white">
                    {tokenBalance !== undefined ? 
                      Number(formatUnits(tokenBalance, selectedToken.decimals)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                      }) : 
                      <Spinner size="sm" />
                    }
                  </p>
                  <span className="text-xs text-gray-400">{selectedToken.symbol}</span>
                </div>
              </div>

              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <p className="text-xs text-gray-400 mb-1">Staked</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white">
                    {stakedTokenAmount !== undefined ? 
                      Number(formatUnits(stakedTokenAmount, selectedToken.decimals)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4
                      }) : 
                      <Spinner size="sm" />
                    }
                  </p>
                  <span className="text-xs text-gray-400">{selectedToken.symbol}</span>
                </div>
              </div>

             <div className="sm:w-48 bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 hover:bg-gray-800/40 transition-colors">
                         <p className="text-sm text-gray-400 mb-2">Pending Rewards</p>
                         <div className="flex items-end justify-between">
                           <div className="min-w-0">
                             <p className="text-2xl font-semibold text-white truncate">
                               {pendingRewards !== undefined ? (
                                 formatUnits(pendingRewards, rewardTokenDecimals)
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
            {!hasApproved && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
              >
                {isApproving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Approving...
                  </>
                ) : (
                  `Approve ${selectedToken.symbol}`
                )}
              </button>
            )}

            {/* Input Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Amount</label>
                <button 
                  onClick={() => tokenBalance && setStakeAmount(formatUnits(tokenBalance, selectedToken.decimals))}
                  className="text-xs bg-gray-700/50 hover:bg-gray-700/60 px-2 py-1 rounded text-blue-400 transition-colors"
                >
                  Max
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder={`0.0 ${selectedToken.symbol}`}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/40 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Action Buttons - Stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleStake}
                disabled={!hasApproved || isStaking || isApproving || parseFloat(stakeAmount) <= 0}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
              >
                {isStaking ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Staking...
                  </>
                ) : (
                  `Stake`
                )}
              </button>

              <button
                onClick={handleUnstake}
                disabled={isUnstaking || parseFloat(stakeAmount) <= 0}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
              >
                {isUnstaking ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Unstaking...
                  </>
                ) : (
                  `Unstake`
                )}
              </button>
            </div>

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={isClaiming || pendingRewards === 0n}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
            >
              {isClaiming ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Claiming...
                </>
              ) : (
                `Claim ${pendingRewards !== undefined ? formatUnits(pendingRewards, rewardTokenDecimals) : '0'} RTK`
              )}
            </button>
          </>
        ) : (
          <div className="text-center p-5 rounded-lg bg-gray-800/40 border border-gray-700/30">
            <p className="text-gray-400 text-sm mb-3">Connect wallet to stake tokens</p>
            <div className="inline-flex items-center px-4 py-2 bg-gray-700/40 rounded-lg border border-gray-600/30">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs text-gray-300">Wallet Disconnected</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleStakingCard;
