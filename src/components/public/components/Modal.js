import React from 'react';
import Loading from './Loading';

const Modal = ({ isOpen, onClose, children, loading, wFitContent = false }) => {
  // Prevent scrolling when the modal is open
  document.body.style.overflow = isOpen ? 'hidden' : '';

  return (
    isOpen && loading ? (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-80"> {/* Higher z-9ndex */}
        <div className={`bg-white opacity-50 fixed  z-80 ${wFitContent ? 'w-fit h-fit' : 'h-screen w-screen'}`}></div>
        <div className="absolute z-90">
          <Loading />
        </div>
      </div>
    ) : isOpen && (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-80"> {/* Higher z-9ndex */}
        <div onClick={onClose} className="bg-black opacity-50 h-full w-full fixed z-80"></div>
        <div className="bg-white rounded-md shadow-lg max-w-full max-h-[95%] overflow-auto z-90">
          <div className='flex'>{children}</div>
        </div>
      </div>
    )
  );
};

export default Modal;

