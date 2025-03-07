import React from 'react';
import './index.css';

const Modal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <p className="modal-message">{message}</p>
                <button className="modal-button" onClick={onClose}>ОК</button>
            </div>
        </div>
    );
};

export default Modal;
