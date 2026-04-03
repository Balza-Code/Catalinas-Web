import React from 'react';

const PosIcon = ({ className = '', size = 28, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <line x1="4" y1="10" x2="20" y2="10"></line>
    <path d="M10 14h4"></path>
  </svg>
);

export default PosIcon;
