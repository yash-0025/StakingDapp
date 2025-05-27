import { useState } from "react";
import { useAccount } from "wagmi";
import "./App.css";
import Header from "./component/Header";
import WalletConnectButton from "./component/WalletConnectButton";
import TokenDisplay from "./component/TokenDisplay";
import StakingCard from "./component/StakingCard";
import { CONTRACT_ADDRESSES } from "./utils/constants";
import { Toaster } from "react-hot-toast";
import Footer from "./component/Footer";
import MultipleStakingCard from "./component/MultipleStakingCard";

function App() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState("single"); // 'single' or 'multi'

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <Toaster position="top-right" />
      <Header />
      
      <main className="flex-1 flex flex-col items-center w-full px-4 py-8">
        <div className="w-full max-w-6xl space-y-10">
          {/* Wallet Section */}
          <section className="flex flex-col items-center">
            <WalletConnectButton />
            
            {isConnected && (
              <div className="mt-4 w-full max-w-lg bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
                <p className="text-center text-gray-300">
                  Connected: <span className="font-mono text-blue-400 break-all">{address}</span>
                </p>
              </div>
            )}
          </section>

          {isConnected ? (
            <>
              {/* Token Holdings Section */}
              <section className="grid grid-cols-1 gap-6 w-full">
                <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-xl shadow-blue-900/10">
                  <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Your Token Holdings
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TokenDisplay 
                      tokenAddress={CONTRACT_ADDRESSES.stakerToken} 
                      className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/30"
                    />
                    <TokenDisplay 
                      tokenAddress={CONTRACT_ADDRESSES.sepoliaDAI} 
                      className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/30"
                    />
                    <TokenDisplay 
                      tokenAddress={CONTRACT_ADDRESSES.sepoliaUSDC} 
                      className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/30"
                    />
                    <TokenDisplay 
                      tokenAddress={CONTRACT_ADDRESSES.rewarderToken} 
                      className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/30"
                    />
                    {/* Add more token displays here if needed */}
                  </div>
                </div>
              </section>

              {/* Staking Section */}
              <section className="grid grid-cols-1 gap-8 w-full">
                <div className="flex flex-col items-center">
                  <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Staking Pools
                  </h2>
                  
                  {/* Tab Navigation */}
                  <div className="flex space-x-2 mb-8 bg-gray-800/50 p-1 rounded-xl border border-gray-700/30">
                    <button
                      onClick={() => setActiveTab("single")}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "single"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Single Token
                    </button>
                    <button
                      onClick={() => setActiveTab("multi")}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "multi"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Multi Token
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="w-full">
                  {activeTab === "single" ? (
                    <StakingCard />
                  ) : (
                    <MultipleStakingCard />
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center max-w-md space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
                  Welcome to Staker's DApp
                </h2>
                <p className="text-lg text-gray-400">
                  Connect your wallet to start staking and earning rewards
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;