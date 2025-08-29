import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaUser, FaTimes, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './RoomsPage.css';

const RoomsPage = () => {
  const navigate = useNavigate();
  const instUrl = process.env.REACT_APP_INSTRUCTION_URL;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentEvent, setCurrentEvent] = useState({ status: false, title: '' });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/auth/status`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const statusData = await response.json();
          
          if (statusData.isAuthenticated) {
            setIsAuthenticated(true);
            setCurrentUser({ 
              username: statusData.username, 
              name: statusData.name, 
              title: statusData.title 
            });
          } else {
            setIsAuthenticated(false);
          }
        } else {
          console.error('Status check failed:', response.statusText);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, [apiUrl]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchRoomStatuses = async () => {
      try {
        const response = await fetch(`${apiUrl}/schedule/status`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(currentUser?.username && { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            })
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('Session expired, redirecting to login');
            setIsAuthenticated(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          setRoomStatuses(data);
        } else {
          console.error('API response is not an array:', data);
          setRoomStatuses([]);
        }
      } catch (error) {
        console.error('Error fetching room statuses:', error);
        setRoomStatuses([]);
        
        if (error.message.includes('403')) {
          console.log('Attempting token refresh...');
          try {
            const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
              method: 'POST',
              credentials: 'include'
            });
            
            if (refreshResponse.ok) {
              return fetchRoomStatuses();
            }
          } catch (refreshError) {
            console.error('Refresh failed:', refreshError);
            setIsAuthenticated(false);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRoomStatuses();
      const interval = setInterval(fetchRoomStatuses, 60000);
      return () => clearInterval(interval);
    }
  }, [apiUrl, isAuthenticated, currentUser]);

  const rooms = [
    { id: 1, name: 'Кабинет №1', type: 'regular' },
    { id: 2, name: 'Кабинет №2', type: 'regular' },
    { id: 3, name: 'Кабинет №3', type: 'regular' },
    { id: 4, name: 'Кабинет №4', type: 'regular' },
    { id: 5, name: 'Кабинет №5', type: 'regular' },
    { id: 6, name: 'Совет университета', type: 'council' },
    { id: 7, name: 'Тестовая комната', type: 'test' },
  ];

  const getRoomStatus = (roomId) => {
    if (!Array.isArray(roomStatuses)) return { status: false };
    const status = roomStatuses.find(room => room.number === roomId);
    return status || { status: false };
  };

  const handleButtonClick = (roomId, role) => {
    const status = getRoomStatus(roomId);
    setSelectedRoom(roomId);
    setSelectedRole(role);
    setCurrentEvent(status); 
    setShowJoinModal(true);
  };
  
  const handleJoinConfirm = () => {
    setShowJoinModal(false);
    
    let roomKey;
    if (selectedRoom === 6) {
      roomKey = '6';
    } else if (selectedRoom === 7) {
      roomKey = '7';
    } else {
      roomKey = `${selectedRoom}${selectedRole === 'host' ? '.1' : '.2'}`;
    }

    const roomUrl = process.env[`REACT_APP_ROOM_URL_${roomKey}`];
    if (roomUrl) {
      window.open(roomUrl, '_blank');
    } else {
      alert('Ошибка: ссылка для подключения не найдена');
    }
  };

  if (authLoading || loading) {
    return <div className="loading-container">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="rooms-page">
      <div className="support-block">
        <p className="support-line1">В случае возникновения вопросов с подключением к видеоконференцсвязи</p>
        <p className="support-line2">телефон технической поддержки: <span className="support-phone">364-26-07</span></p>
      </div>

      <div className="header-block">
        <div className="header-buttons">
          <button 
            className="schedule-button"
            onClick={() => navigate('/rooms')}
          >
            Расписание кабинетов
          </button>
          <button 
            className="instruction-record-button"
            onClick={() => navigate('/instruction')}
          >
            Инструкция по записи
          </button>
        </div>
      </div>

      <div className="rooms-grid">
        {rooms.map(room => {
          const status = getRoomStatus(room.id);
          const hasEvent = status.status;
          
          return (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <div className="room-name">{room.name}</div>
                <div className="status-container">
                  <div className={`status-indicator ${hasEvent ? 'active' : 'inactive'}`}>
                    <div className="pulse-effect"></div>
                  </div>
                  {hasEvent && (
                    <div className="status-tooltip">
                      <div className="tooltip-content">
                        <p><strong>Мероприятие:</strong> { status.title}</p>
                        {status.titleorg && <p><strong>Ведущий:</strong> {status.name}</p>}
                        <p>
                          <strong>Время:</strong> 
                          {new Date(status.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {new Date(status.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>                      
                      </div>
                    </div>
                  )}
                  {!hasEvent && (
                    <div className="status-tooltip">
                      <div className="tooltip-content">
                        <p><strong>Кабинет свободен</strong> { status.title}</p>              
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
              <div className="divider"></div>
              <div className="buttons-row">
                {room.id === 6 ? (
                  <button 
                    className="participant-btn single-btn"
                    onClick={() => handleButtonClick(room.id, 'participant')}
                  >
                    <FaUser className="btn-icon" />
                    Участник
                  </button>
                ) : room.id === 7 ? (
                  <button 
                    className="participant-btn single-btn"
                    onClick={() => handleButtonClick(room.id, 'participant')}
                  >
                    <FaUser className="btn-icon" />
                    Участник
                  </button>
                ) : (
                  <>
                    <button 
                      className="host-btn"
                      onClick={() => handleButtonClick(room.id, 'host')}
                    >
                      <FaMicrophone className="btn-icon" />
                      Ведущий
                    </button>
                    <button 
                      className="participant-btn"
                      onClick={() => handleButtonClick(room.id, 'participant')}
                    >
                      <FaUser className="btn-icon" />
                      Участник
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showJoinModal && (
        <div className="modal-overlay">
          <div className="join-modal">
            <h2 className="modal-title">Подтверждение входа</h2>
            <div className="modal-content">
            <p className="event-status">
              {currentEvent?.status ? (
                <>
                  <div>Сейчас проходит: {currentEvent.title || 'мероприятие'}</div>
                  <div>Ведущий: {currentEvent.name || 'не указан'}</div>
                  <div>
                    Время проведения: {new Date(currentEvent.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} -
                    {" "+ new Date(currentEvent.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </>
              ) : (
                'Сейчас ничего не проходит'
              )}
            </p>
              <p className="join-question">Хотите присоединиться?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowJoinModal(false)}
              >
                <FaTimes /> Отмена
              </button>
              <button 
                className="confirm-btn"
                onClick={handleJoinConfirm}
              >
                <FaCheck /> Присоединиться
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="warning-block">
        <p className="warning-text">Уважаемые преподаватели!</p>
        <p className="warning-text">Категорически запрещено менять настройки комнат при проведении видеоконференции.</p>
      </div>

      <div className="instruction-button-container">
        <button className="instruction-btn" onClick={() => window.open(instUrl, '_blank')}>
          Инструкция
        </button>
      </div>
    </div>
  );
};

export default RoomsPage;