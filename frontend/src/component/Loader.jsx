import React, { useState, useEffect } from 'react'

export const Loader = ({ duration = 3000 }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 5))
    }, duration / 20)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className="w-full space-y-2">
      {/* Percentage display with shine */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-white">Loading</span>
        <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {progress}%
        </span>
      </div>
      
      {/* Animated progress bar */}
      <div className="relative w-full h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
        {/* Main gradient progress */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 50%, #00d2ff 100%)',
            backgroundSize: '200% 100%',
            animation: 'shine 1.5s linear infinite'
          }}
        />
        
        {/* Glow effect */}
        <div 
          className="absolute top-0 h-full rounded-full blur-[4px] opacity-70"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(0,210,255,0.7) 0%, rgba(58,123,213,0.7) 100%)'
          }}
        />
      </div>
      
      
      <style jsx>{`
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  )
}