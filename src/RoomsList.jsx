import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const RoomButton = ({ roomNumber }) => {
  const navigate = useNavigate(); 

  const handleClick = () => {
    navigate(`/?num=${roomNumber}`);
  };

  return (
    <button onClick={handleClick} className="room-button">
      Кабинет №{roomNumber}
    </button>
  );
};

const RoomsList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const statusUrl = `${apiUrl}/auth/status`;
  const authUrl = '/auth';
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(statusUrl, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Status check failed:', response.statusText);
          setIsAuthenticated(false);
        } else {
          const statusData = await response.json();
          setIsAuthenticated(statusData.isAuthenticated);
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); 
      }
    };

    checkAuthStatus();
  }, [statusUrl]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate(authUrl); 
    }
  }, [isLoading, isAuthenticated, authUrl, navigate]); 

  const renderRoomButtons = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <RoomButton key={index + 1} roomNumber={index + 1} />
    ));
  };

  if (isLoading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="rooms-container">
      <div className="rooms-grid-unique">
        {renderRoomButtons()}
      </div>
    </div>
  );
};

export default RoomsList;
