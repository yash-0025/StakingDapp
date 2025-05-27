import React from "react";

const Footer = () => {
  return (
    <footer className="w-10/12 max-w-7xl mx-auto py-6 px-6 backdrop-blur-md bg-white/5 border-t border-white/10 shadow-lg rounded-xl mb-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-lg font-medium bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Staker's DApp
          </span>
        </div>
        <p className="text-sm text-white/60">
          Decentralized staking platform © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;