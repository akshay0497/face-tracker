import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'terminated' | 'pending' | 'verified' | 'rejected' | 'IN' | 'OUT';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bgColor = '';
  let textColor = '';
  let label = status;
  
  // Set colors based on status
  switch (status) {
    case 'active':
      bgColor = 'bg-success-100';
      textColor = 'text-success-800';
      break;
    case 'inactive':
      bgColor = 'bg-warning-100';
      textColor = 'text-warning-800';
      break;
    case 'terminated':
      bgColor = 'bg-error-100';
      textColor = 'text-error-800';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'verified':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'IN':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      label = 'Check In';
      break;
    case 'OUT':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      label = 'Check Out';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  // Set size classes
  let sizeClasses = 'px-2.5 py-0.5 text-xs';
  if (size === 'sm') {
    sizeClasses = 'px-2 py-0.5 text-xs';
  } else if (size === 'lg') {
    sizeClasses = 'px-3 py-1 text-sm';
  }
  
  return (
    <span className={`inline-flex items-center rounded-full ${bgColor} ${textColor} ${sizeClasses} font-medium capitalize`}>
      {label}
    </span>
  );
};

export default StatusBadge;