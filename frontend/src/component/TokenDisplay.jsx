import { useAccount, useReadContract } from 'wagmi'
import { ERC20Abi } from '../utils/constants'
import { formatUnits } from 'viem'
import { Loader } from './Loader'

const TokenDisplay = ({ tokenAddress, className = '' }) => {
  const { address: userAddress, isConnected } = useAccount()

  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: ERC20Abi,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20Abi,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20Abi,
    functionName: 'decimals',
  })

  const {
    data: balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
    },
  })

  // Custom Wallet Icon SVG
  const WalletIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-4"></path>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"></path>
    </svg>
  )

  return (
    <div className={`bg-gray-900/60 border border-gray-700/40 rounded-2xl shadow-xl p-6 transition hover:shadow-blue-800/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600/50 to-purple-600/40 flex items-center justify-center shadow-md">
            <span className="text-xl font-bold text-white">
              {symbol?.toString().charAt(0) || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{name || 'Loading...'}</h2>
            <span className="text-sm font-mono text-gray-400">{symbol || '---'}</span>
          </div>
        </div>
        <div className="bg-blue-800/20 px-3 py-1 rounded-full text-xs font-medium text-blue-300 border border-blue-500/30">
          ERC-20
        </div>
      </div>

      {/* Balance Section */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Balance</span>
          {userAddress && (
            <button
              onClick={() => refetchBalance()}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        {isConnected ? (
          balanceLoading ? (
            <div className="h-10 flex items-center">
              <Loader size="sm" />
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">
                {parseFloat(formatUnits(balance || 0n, decimals || 18)).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4
                })}
              </p>
              <span className="text-lg text-gray-300">{symbol}</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-gray-400 mt-2">
            <WalletIcon />
            <span className="text-sm">Connect your wallet to view balance</span>
          </div>
        )}
      </div>

      {/* Token Details */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/30">
          <p className="text-xs text-gray-400 mb-1">Token Address</p>
          <p
            className="text-sm font-mono text-blue-400 truncate cursor-pointer"
            title={tokenAddress}
            onClick={() => navigator.clipboard.writeText(tokenAddress)}
          >
            {tokenAddress}
          </p>
        </div>
        <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/30">
          <p className="text-xs text-gray-400 mb-1">Decimals</p>
          <p className="text-sm font-mono text-white">{decimals?.toString() || '18'}</p>
        </div>
      </div>
    </div>
  )
}

export default TokenDisplay