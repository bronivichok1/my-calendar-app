import React from 'react';

import './index.css';

const Modal = ({ isOpen, message, onClose, showCancelButton, onCancel }) => {
  if (!isOpen) return null;

  // Определяем, какая функция должна быть вызвана при закрытии не кнопками OK/Отмена
  const handleCloseAction = () => {
    if (showCancelButton && onCancel) {
      onCancel(); // Вызываем onCancel если кнопка отмены видна
    } else {
      onClose(); // Иначе вызываем стандартное onClose
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCloseAction}> {/* Добавляем обработчик клика на оверлей */}
      <div className="modal-content" onClick={e => e.stopPropagation()}> {/* Предотвращаем всплытие клика с контента */}
        <span className="close" onClick={handleCloseAction}>&times;</span> {/* Обновляем обработчик клика на крестик */}
        <p className="modal-message">{message}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <button className="modal-button" onClick={onClose}> {/* Кнопка OK всегда вызывает onClose */}
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