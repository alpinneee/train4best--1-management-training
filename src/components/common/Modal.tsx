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
      className="fixed inset-0 z-[9999] overflow-y-auto px-2 py-2 sm:p-0"
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        
        <div 
          ref={modalRef}
          className="relative bg-gray-700 rounded-2xl w-full sm:w-[500px] mx-auto z-[10000] p-3 sm:p-4 max-h-[90vh] overflow-y-auto shadow-lg"
        >
          <button 
            onClick={onClose} 
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-gray-600 p-1.5 hover:bg-gray-300 rounded-xl bg-gray-100 transition-colors duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
          <div className="text-sm sm:text-base bg-white p-3 rounded-xl">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;