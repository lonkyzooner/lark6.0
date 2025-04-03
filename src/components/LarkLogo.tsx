import React from 'react';

interface LarkLogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

/**
 * LARK Logo component
 * Displays the LARK (Law Enforcement Assistance and Response Kit) logo with a polar bear
 */
const LarkLogo: React.FC<LarkLogoProps> = ({
  width = 200,
  height = 200,
  className = '',
  showText = true
}) => {
  return (
    <div className={`lark-logo ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="400" height="400" rx="20" fill="#7FB3D5" />

        {/* Polar Bear */}
        <g transform="translate(50, 40) scale(0.8)">
          {/* Body */}
          <path d="M240 220C240 180 200 150 150 150C100 150 60 180 60 220L60 280L240 280L240 220Z" fill="#1A2A3A" />
          <path d="M250 100C250 155.228 205.228 200 150 200C94.7715 200 50 155.228 50 100C50 44.7715 94.7715 0 150 0C205.228 0 250 44.7715 250 100Z" fill="white" />

          {/* Head */}
          <path d="M150 40C177.614 40 200 62.3858 200 90C200 117.614 177.614 140 150 140C122.386 140 100 117.614 100 90C100 62.3858 122.386 40 150 40Z" fill="white" />

          {/* Ears */}
          <circle cx="110" cy="60" r="15" fill="white" />
          <circle cx="190" cy="60" r="15" fill="white" />

          {/* Eyes */}
          <circle cx="130" cy="85" r="5" fill="black" />
          <circle cx="170" cy="85" r="5" fill="black" />

          {/* Nose */}
          <path d="M150 95C156.075 95 161 99.9249 161 106C161 112.075 156.075 117 150 117C143.925 117 139 112.075 139 106C139 99.9249 143.925 95 150 95Z" fill="black" />

          {/* Legs */}
          <rect x="80" y="280" width="30" height="40" rx="10" fill="white" />
          <rect x="190" y="280" width="30" height="40" rx="10" fill="white" />

          {/* Arms */}
          <rect x="60" y="180" width="25" height="60" rx="10" fill="white" />
          <rect x="215" y="180" width="25" height="60" rx="10" fill="white" />
        </g>

        {/* LARK Text */}
        {showText && (
          <g transform="translate(100, 330)">
            <path d="M20 0H0V60H20V0Z" fill="white" />
            <path d="M30 0H50V60H70V40H90V20H70V0H30V20H50V40H30V0Z" fill="white" />
            <path d="M100 0H120V40H140V20H160V40H180V0H200V60H100V0Z" fill="white" />
            <path d="M210 0H230V20H250V0H270V60H250V40H230V60H210V0Z" fill="white" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default React.memo(LarkLogo);
