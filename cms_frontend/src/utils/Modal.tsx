import React from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
