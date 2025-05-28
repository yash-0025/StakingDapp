import React from "react";

const Footer = () => {
  return (
    <footer className="w-10/12 max-w-7xl mx-auto py-6 px-6 backdrop-blur-md bg-white/5 border-t border-white/10 shadow-lg rounded-xl mb-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className="w-10 h-10"
          >
            {/* Base circle with gradient */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" /> {/* Green */}
                <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
              </linearGradient>
            </defs>

            {/* Logo symbol - combines upward arrow (staking) and coins */}
            <circle
              cx="32"
              cy="32"
              r="24"
              fill="url(#gradient)"
              opacity="0.8"
            />

            {/* Coin stack with upward arrow integrated */}
            <g fill="white">
              {/* Arrow shaft */}
              <rect x="29" y="18" width="6" height="20" rx="1" />

              {/* Arrow head */}
              <polygon points="32,12 38,18 26,18" />

              {/* Coin layers */}
              <circle cx="32" cy="32" r="8" opacity="0.9" />
              <circle cx="32" cy="38" r="6" opacity="0.7" />
              <circle cx="32" cy="43" r="4" opacity="0.5" />
            </g>
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