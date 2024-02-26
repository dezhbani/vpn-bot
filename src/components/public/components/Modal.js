// Modal.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Modal.css'
import Loading from '../../admin/public/Loading';

const Modal = ({ isOpen , onClose, children, loading }) => {

  document.body.style.overflow = isOpen? 'hidden' : ''

  return (
    isOpen && loading? (
      <div className="modal-overlay">
        <div className='bg-white opacity-50 h-full w-full fixed'></div>
        <div className='modal-container'>
                <Loading />
        </div>
      </div>
    ): isOpen && (
      <div className="modal-overlay">
          <div onClick={onClose} className='bg-black opacity-50 h-full w-full fixed'></div>
          <div className='modal-container'>
              <div className="modal">
                  <div className="modal-content">{children}</div>
              </div>
          </div>
      </div>
    )
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
