import React from 'react';
import './index.css';

const Modal = ({ isOpen, message, onClose, showCancelButton, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <p className="modal-message">{message}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <button className="modal-button" onClick={onClose}>
            OK
          </button>
          {showCancelButton && (
            <button
              className="modal-button"
              onClick={onCancel}
              style={{ backgroundColor: 'red' }}
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
