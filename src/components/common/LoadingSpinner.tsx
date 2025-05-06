import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary-600',
  text
}) => {
  let sizeClass = 'h-8 w-8';
  
  switch (size) {
    case 'sm':
      sizeClass = 'h-5 w-5';
      break;
    case 'lg':
      sizeClass = 'h-12 w-12';
      break;
    default:
      sizeClass = 'h-8 w-8';
  }
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-r-2 border-b-2 border-transparent border-t-${color} ${sizeClass}`} />
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;