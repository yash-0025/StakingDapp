import { useAccount, useReadContract } from 'wagmi'
import { ERC20Abi } from '../utils/constants'
import { formatUnits } from 'viem'
import { Loader } from './Loader'

const TokenDisplay = ({ tokenAddress, className = '' }) => {
  const { address: userAddress } = useAccount()
  const contractAddress = tokenAddress

  const { data: name, isLoading: nameLoading } = useReadContract({
    address: contractAddress,
    abi: ERC20Abi,
    functionName: 'name',
  })

  const { data: symbol, isLoading: symbolLoading } = useReadContract({
    address: contractAddress,
    abi: ERC20Abi,
    functionName: 'symbol',
  })

  const { data: decimals, isLoading: decimalLoading } = useReadContract({
    address: contractAddress,
    abi: ERC20Abi,
    functionName: 'decimals',
  })

  const { 
    data: balance, 
    isLoading: balanceLoading, 
    refetch: refetchBalance 
  } = useReadContract({
    address: contractAddress,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
    },
  })

  const isLoading = nameLoading || symbolLoading || decimalLoading || balanceLoading

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-blue-900/20 ${className}`}>
      {isLoading ? (
        <div className="p-6 flex justify-center items-center h-40">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="p-6">
          {/* Token Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {symbol?.toString().charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{name}</h3>
                  <p className="text-sm text-gray-400 font-mono">{symbol}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/60 px-2.5 py-1 rounded-md text-xs font-medium text-blue-300 border border-blue-500/20">
              ERC-20
            </div>
          </div>

          {/* Balance Display */}
          {userAddress && balance !== undefined && (
            <div className="mb-6">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Balance</span>
                <button 
                  onClick={() => refetchBalance()}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">
                  {parseFloat(formatUnits(balance, decimals || 18)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4
                  })}
                </p>
                <span className="text-lg text-gray-300">{symbol}</span>
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            </div>
          )}

          {/* Token Details */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
              <p className="text-xs text-gray-400 mb-1">Contract</p>
              <p className="text-sm font-mono text-blue-300 truncate">{contractAddress}</p>
            </div>
            <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
              <p className="text-xs text-gray-400 mb-1">Decimals</p>
              <p className="text-sm font-mono text-white">{decimals?.toString() || '18'}</p>
            </div>
          </div>

          {/* Action Buttons */}
         {/*  <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/40 rounded-lg text-sm text-white transition-colors">
              Send
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all">
              Receive
            </button>
          </div> */}
        </div>
      )}
    </div>
  )
}

export default TokenDisplay