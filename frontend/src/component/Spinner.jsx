import React from 'react'

export const Spinner = ({ size = 'md', color = 'indigo' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-[3px]',
    lg: 'h-8 w-8 border-4'
  }

  const colorClasses = {
    indigo: 'border-indigo-500 border-t-indigo-200',
    white: 'border-white border-t-transparent',
    blue: 'border-blue-500 border-t-blue-200',
    green: 'border-green-500 border-t-green-200'
  }

  return (
    <div 
      className={`inline-block ${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
    />
  )
}

// Usage: <Spinner size="md" color="indigo" />