
import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const WalletConnectButton = () => {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);

  // Perfectly crafted wallet provider logos
  const WalletIcons = {
    'MetaMask': (
       <svg width="20" height="20" viewBox="0 0 40 37" className="shrink-0">
                        <path d="M36.5 0.5L22.1 12.3V12.3L36.5 0.5Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.5 0.5L17.8 12.4V12.4L3.5 0.5Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M31.5 26.5L27.4 32.6L35.1 34.2L37.5 26.6V26.6L31.5 26.5Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 26.6L4.9 34.2L12.6 32.6L8.5 26.5V26.5L2.5 26.6Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.9 16.2L10.5 20.3L18.1 20.7L17.8 12.1V12.1L12.9 16.2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M27.1 16.2L22 12V12V12.1L21.9 20.7L29.5 20.3L27.1 16.2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.6 32.6L18.3 30.1L13.4 26.6V26.6L12.6 32.6Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21.7 30.1L27.4 32.6L26.6 26.5V26.5L21.7 30.1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M27.4 32.6L21.7 30.1L22.5 33.8L22.5 36.5L27.4 32.6Z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.6 32.6L17.5 36.5V33.8L18.3 30.1L12.6 32.6Z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17.6 24.2L13.4 22.9L16.3 21.3L17.6 24.2Z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22.4 24.2L23.7 21.3L26.6 22.9L22.4 24.2Z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.6 32.6L13.5 26.5L8.5 26.6L12.6 32.6Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M26.5 26.5L27.4 32.6L31.5 26.6L26.5 26.5Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M29.5 20.3L21.9 20.7L22.4 24.2L23.7 21.3L26.6 22.9L29.5 20.3Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.4 22.9L16.3 21.3L17.6 24.2L18.1 20.7L10.5 20.3L13.4 22.9Z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.5 20.3L13.4 26.5L13.4 22.9L10.5 20.3Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M26.6 22.9L26.6 26.5L29.5 20.3L26.6 22.9Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.1 20.7L17.6 24.2L18.4 27.6L18.6 23.1L18.1 20.7Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21.9 20.7L21.4 23L21.6 27.6L22.4 24.2L21.9 20.7Z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22.4 24.2L21.6 27.6L22.1 30.1L26.6 26.5L26.6 22.9L22.4 24.2Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.4 22.9L13.4 26.5L17.9 30.1L18.4 27.6L17.6 24.2L13.4 22.9Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22.5 36.5L22.5 33.8L22.1 33.5H17.9L17.5 33.8V36.5L12.6 32.6L14.9 34.5L17.9 37H22.1L25.1 34.5L27.4 32.6L22.5 36.5Z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21.7 30.1L22.1 33.5H17.9L18.3 30.1L17.5 33.8V36.5H22.5V33.8L21.7 30.1Z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M37.9 13.9L40 6.5L36.5 0.5L22.1 12.3L27.1 16.2L35.2 18.3L37.7 16.4L36.8 15.7L38.4 14.5L37.4 13.8L39 12.9L37.9 13.9Z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M0 6.5L2.1 13.9L1 12.9L2.6 13.8L1.6 14.5L3.2 15.7L2.3 16.4L4.8 18.3L12.9 16.2L17.9 12.3L3.5 0.5L0 6.5Z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M35.2 18.3L27.1 16.2L29.5 20.3L26.6 26.5L31.5 26.6H37.5L35.2 18.3Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.9 16.2L4.8 18.3L2.5 26.6H8.5L13.4 26.5L10.5 20.3L12.9 16.2Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21.9 20.7L22.1 12.3L24.5 6.5H15.5L17.9 12.3L18.1 20.7L17.8 23.1L17.9 30.1H21.9L22.1 23.1L21.9 20.7Z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
    ),
    
    'Default': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-4" stroke="currentColor" strokeWidth="2"/>
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  };

  return (
    <div className="relative w-full max-w-xs">
      {isConnected ? (
        <button
          onClick={() => disconnect()}
          className="w-full px-6 py-3 bg-gradient-to-r from-rose-500/90 to-amber-500/90 hover:from-rose-600 hover:to-amber-600 text-white font-medium rounded-xl shadow-lg transition-all duration-200"
        >
          Disconnect Wallet
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg transition-all duration-200"
          >
            <span>Connect Wallet</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-full bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/30 overflow-hidden animate-fadeIn">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-white/90 hover:text-white hover:bg-gray-700/40 transition-all flex items-center gap-3 border-t border-gray-700/30 first:border-t-0"
                >
                  <span className="shrink-0 text-gray-300">
                    {WalletIcons[connector.name] || WalletIcons.Default}
                  </span>
                  <span className="truncate font-medium">Connect {connector.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;