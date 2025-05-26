import { useAccount, useReadContract } from 'wagmi'
import { ERC20Abi } from '../utils/constants'
import { formatUnits } from 'viem'
import { Loader } from './Loader'

const TokenDisplay = ({ tokenAddress }) => {
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
    <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden">
      <div className="relative p-0.5 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/10">
        <div className="backdrop-blur-xl bg-gray-900/60 border border-gray-700/50 rounded-xl shadow-lg">
          {isLoading ? (
            <div className="p-6 flex justify-center items-center h-40">
              <Loader />
            </div>
          ) : (
            <div className="p-6">
              {/* Header with shine effect */}
              <div className="relative mb-6">
                <div className="absolute -top-4 -right-4 h-16 w-16 bg-blue-500/20 rounded-full filter blur-xl"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{name}</h3>
                    <p className="text-blue-300/80 font-mono text-sm">{symbol}</p>
                  </div>
                  <div className="bg-gray-800/50 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 border border-blue-500/30">
                    ERC-20
                  </div>
                </div>
              </div>

              {/* Balance with animated gradient underline */}
              {userAddress && balance !== undefined && (
                <div className="mb-8 relative group">
                  <p className="text-sm text-gray-400 mb-2">Your Balance</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-white">
                      {formatUnits(balance, decimals || 18)}
                    </p>
                    <span className="text-blue-300/80">{symbol}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-blue-500/0 via-blue-400 to-blue-500/0 group-hover:w-full transition-all duration-500"></div>
                </div>
              )}

              {/* Shiny gradient button */}
              <div className="flex justify-end">
                <button
                  onClick={() => refetchBalance()}
                  className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-br from-blue-600/90 to-indigo-700/90 text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <span className="relative z-10">Refresh Balance</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TokenDisplay