import React from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";

interface ToggleButtonProps {
  isActive: boolean;
  onToggle: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isActive, onToggle }) => (
  <button className="focus:outline-none" onClick={onToggle}>
    {isActive ? (
      <FaToggleOn className="text-teal-600" size={24} />
    ) : (
      <FaToggleOff className="text-gray-400" size={24} />
    )}
  </button>
);

export default ToggleButton;
