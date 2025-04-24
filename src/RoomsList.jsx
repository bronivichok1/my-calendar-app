import React, { useEffect } from 'react';
import './index.css';

const RoomButton = ({ roomNumber }) => {
  const handleClick = () => {
    window.location.href = `/?num=${roomNumber}`;
  };

  return (
    <button onClick={handleClick} className="room-button">
      Комната {roomNumber}
    </button>
  );
};

const RoomsList = () => {
  const logoutUrl = `${process.env.REACT_APP_API_URL}/auth/logout`;

  const handleLogout = async () => {
    try {
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include', // Включаем куки
      });

      if (response.ok) {
        window.location.href = '/auth'; // Перенаправление на страницу авторизации после выхода
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const renderRoomButtons = () => {
    return Array.from({ length: 6 }, (_, index) => (
      <RoomButton key={index + 1} roomNumber={index + 1} />
    ));
  };

  useEffect(() => {
    const checkAuthenticated = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include', // Включаем куки
        });

        if (!response.ok) {
          // Если ответ не успешен, перенаправляем на страницу аутентификации
          window.location.href = '/auth';
        }
      } catch (err) {
        console.error('Authentication check error:', err);
        window.location.href = '/auth';
      }
    };

    checkAuthenticated();
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </header>
      <div className="rooms-grid">
        {renderRoomButtons()}
      </div>
    </div>
  );
};

export default RoomsList;