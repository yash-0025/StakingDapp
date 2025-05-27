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

const MutlipleStakingCard = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState([0]);
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
      args: [selectedToken.address, userAddress],
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
  const { writeContrac: writeClaim, data: claimHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });
  const { isLoadin: isStaking, isSuccess: isStakeSuccess } =
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
    if (!userAddres) return;
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
   <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-gray-900/60 to-gray-800/50 border border-gray-700/20 shadow-2xl shadow-blue-900/20 hover:shadow-blue-900/30 transition-all duration-500 relative">
  {/* Shine overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-white/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
  
  {/* Inner glow */}
  <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none"></div>

  {/* Header */}
  <div className="relative p-6 border-b border-gray-700/30">
    <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/20 rounded-full filter blur-[80px] z-0"></div>
    <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200 relative z-10">
      Multi-Token Staking
    </h2>
    <p className="text-center text-blue-300/80 mt-2">Earn RTK rewards</p>
  </div>

  <div className="p-6 space-y-6 relative z-10">
    {isConnected ? (
      <>
        {/* Token Selector - Elegant Dropdown */}
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
            className="w-full px-5 py-3 backdrop-blur-sm bg-gray-800/50 border border-gray-700/40 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
          >
            {supportedStakingTokens.map((token) => (
              <option key={token.address} value={token.address} className="bg-gray-800 text-white">
                {token.name} ({token.symbol})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Balance Card */}
          <div className="backdrop-blur-sm bg-gray-800/40 p-5 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-5 -top-5 w-20 h-20 bg-blue-500/10 rounded-full filter blur-[30px]"></div>
            <p className="text-sm text-gray-300 mb-2">Your Balance</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-white truncate">
                {tokenBalance !== undefined ? formatUnits(tokenBalance, selectedToken.decimals) : <Spinner size="md" />}
              </p>
              <span className="text-sm text-gray-300 ml-2 whitespace-nowrap">{selectedToken.symbol}</span>
            </div>
          </div>

          {/* Staked Card */}
          <div className="backdrop-blur-sm bg-gray-800/40 p-5 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-5 -top-5 w-20 h-20 bg-purple-500/10 rounded-full filter blur-[30px]"></div>
            <p className="text-sm text-gray-300 mb-2">Staked</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-white truncate">
                {stakedTokenAmount !== undefined ? formatUnits(stakedTokenAmount, selectedToken.decimals) : <Spinner size="md" />}
              </p>
              <span className="text-sm text-gray-300 ml-2 whitespace-nowrap">{selectedToken.symbol}</span>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="backdrop-blur-sm bg-gray-800/40 p-5 rounded-xl border border-gray-700/30 hover:bg-gray-800/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-5 -top-5 w-20 h-20 bg-emerald-500/10 rounded-full filter blur-[30px]"></div>
            <p className="text-sm text-gray-300 mb-2">Pending Rewards</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-white truncate">
                {pendingRewards !== undefined ? formatUnits(pendingRewards, rewardTokenDecimals) : <Spinner size="md" />}
              </p>
              <span className="text-sm text-gray-300 ml-2 whitespace-nowrap">RTK</span>
            </div>
          </div>
        </div>

        {/* Approval Button */}
        {!hasApproved && (
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full px-6 py-4 bg-gradient-to-r from-amber-500/90 to-orange-600/90 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              {isApproving ? (
                <>
                  <Spinner size="md" className="mr-3" />
                  Approving...
                </>
              ) : (
                `Approve ${selectedToken.symbol}`
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </button>
        )}

        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Amount to Stake/Unstake</label>
            <button 
              onClick={() => tokenBalance && setStakeAmount(formatUnits(tokenBalance, selectedToken.decimals))}
              className="text-xs bg-gray-700/50 hover:bg-gray-700/70 px-3 py-1.5 rounded-lg text-blue-300 transition-all duration-300"
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
              className="w-full px-5 py-4 backdrop-blur-sm bg-gray-800/50 border border-gray-700/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all text-lg placeholder-gray-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleStake}
            disabled={!hasApproved || isStaking || isApproving || parseFloat(stakeAmount) <= 0}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500/90 to-emerald-600/90 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              {isStaking ? (
                <>
                  <Spinner size="md" className="mr-3" />
                  Staking...
                </>
              ) : (
                `Stake ${selectedToken.symbol}`
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </button>

          <button
            onClick={handleUnstake}
            disabled={isUnstaking || parseFloat(stakeAmount) <= 0}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500/90 to-red-600/90 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              {isUnstaking ? (
                <>
                  <Spinner size="md" className="mr-3" />
                  Unstaking...
                </>
              ) : (
                `Unstake ${selectedToken.symbol}`
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </button>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={isClaiming || pendingRewards === 0n}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center">
            {isClaiming ? (
              <>
                <Spinner size="md" className="mr-3" />
                Claiming...
              </>
            ) : (
              `Claim ${pendingRewards !== undefined ? formatUnits(pendingRewards, rewardTokenDecimals) : '0'} RTK`
            )}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
        </button>
      </>
    ) : (
      <div className="text-center p-8 rounded-xl backdrop-blur-sm bg-gray-800/40 border border-gray-700/30">
        <p className="text-gray-300 mb-5 text-lg">Connect wallet to stake tokens</p>
        <div className="inline-flex items-center px-5 py-3 backdrop-blur-sm bg-gray-700/40 rounded-xl border border-gray-600/40 hover:bg-gray-700/50 transition-all duration-300">
          <svg className="w-5 h-5 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default MutlipleStakingCard;
