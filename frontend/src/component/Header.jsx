import React from "react";

const Header = () => {
  return (
    <header className="w-10/12 max-w-7xl mx-auto py-4 px-6 backdrop-blur-md bg-white/5 border-b border-white/10 shadow-lg rounded-xl sticky top-0 z-50 ">
      <div className="flex justify-center items-center"> 
        <div className="flex items-center space-x-2 ">
          <svg
            className="w-8 h-8 text-green-400"
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
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Staker's DApp
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;