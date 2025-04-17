import React, { useEffect } from 'react';
import './index.css';


const RoomButton = ({ roomNumber}) => {
  const handleClick = () => {
    window.location.href = `/?num=${roomNumber}`;
  };

  return (
    <button
      onClick={handleClick}
      className="room-button"
    >
      Комната {roomNumber}
    </button>
  );
};

const RoomsList = () => {

  const renderRoomButtons = () => {
    return Array.from({ length: 6 }, (_, index) => (
      <RoomButton key={index + 1} roomNumber={index + 1} />
    ));
  };

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem('user')); 
    if (!user) { 
      window.location.href = '/auth'; 
      return;
    }
  },[])
  
  return (
    <div className="App">
      <div className="rooms-grid">
        {renderRoomButtons()}
      </div>
    </div>
  );
};

export default RoomsList;
