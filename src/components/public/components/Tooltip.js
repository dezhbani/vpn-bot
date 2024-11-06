import React, { useState } from 'react';
import './Tooltip.css'; // Import your CSS file for styling

const Tooltip = ({ text, children, className="" }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="tooltip-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {showTooltip && <div className={`tooltip ${className}`}>{text}</div>}
    </div>
  );
};

export default Tooltip;
