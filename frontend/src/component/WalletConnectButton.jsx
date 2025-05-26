import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

const WalletConnectButton = () => {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="mt-4 w-full max-w-md mx-auto">
      {isConnected ? (
        <button
          onClick={() => disconnect()}
          className="w-full px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
        >
          Disconnect Wallet
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-col sm:space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="w-full px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default WalletConnectButton