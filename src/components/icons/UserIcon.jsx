import React from 'react';

export default function UserIcon({ className = '', size = 28, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M12 12.5c2.071 0 3.75-1.679 3.75-3.75S14.071 5 12 5 8.25 6.679 8.25 8.75 9.929 12.5 12 12.5Zm0 1.5c-2.485 0-7.5 1.248-7.5 3.75V20h15v-2.25c0-2.502-5.015-3.75-7.5-3.75Z"
        fill="currentColor"
      />
    </svg>
  );
}
