import React from 'react';

interface TottusLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'white';
}

export const TottusLogo: React.FC<TottusLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  variant = 'color'
}) => {
  // Dot colors based on official Tottus Brand Manual
  // Corners: lime/chartreuse (#D4E137 / #CEE02E)
  // Edges (Top, Bottom, Left, Right): Tottus Green (#5FAF16 / #62A81E)
  // Center: Deep Forest Green (#085B28 / #0D6833)
  const isWhite = variant === 'white';
  const cornerColor = isWhite ? '#FFFFFF' : '#D4E137';
  const edgeColor = isWhite ? '#FFFFFF' : '#5FAF16';
  const centerColor = isWhite ? '#E5E7EB' : '#085B28';
  const textColor = isWhite ? '#FFFFFF' : '#5FAF16';

  const heights = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${heights[size]} ${className}`}>
      {/* 3x3 Dots Symbol */}
      <svg
        viewBox="0 0 100 100"
        className="h-full aspect-square shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tottus Logo Icon"
      >
        {/* Row 1 */}
        <circle cx="20" cy="20" r="14" fill={cornerColor} />
        <circle cx="50" cy="20" r="14" fill={edgeColor} />
        <circle cx="80" cy="20" r="14" fill={cornerColor} />

        {/* Row 2 */}
        <circle cx="20" cy="50" r="14" fill={edgeColor} />
        <circle cx="50" cy="50" r="14" fill={centerColor} />
        <circle cx="80" cy="50" r="14" fill={edgeColor} />

        {/* Row 3 */}
        <circle cx="20" cy="80" r="14" fill={cornerColor} />
        <circle cx="50" cy="80" r="14" fill={edgeColor} />
        <circle cx="80" cy="80" r="14" fill={cornerColor} />
      </svg>

      {/* Brand Text TOTTUS */}
      {showText && (
        <svg
          viewBox="0 0 340 70"
          className="h-[76%] shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="TOTTUS"
        >
          <text
            x="0"
            y="55"
            fill={textColor}
            style={{
              fontFamily: "'Arial Black', 'Montserrat', 'Impact', sans-serif",
              fontWeight: 900,
              fontSize: '66px',
              letterSpacing: '-1.5px'
            }}
          >
            TOTTUS
          </text>
        </svg>
      )}
    </div>
  );
};
