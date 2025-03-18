import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        
        <div className="relative bg-white rounded-lg w-[500px] mx-auto z-[10000] p-6">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-600">
            &times;
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;