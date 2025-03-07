import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLocation } from 'react-router-dom';
import './index.css';
import Modal from './Modal.jsx';

const localizer = momentLocalizer(moment);

function App() {
  const query = new URLSearchParams(useLocation().search);
  const number = query.get('num') || "1";
  const check = query.get('ch') || 'false';

  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const roomUrls = {
    1: process.env.REACT_APP_ROOM1_URL,
    2: process.env.REACT_APP_ROOM2_URL,
    3: process.env.REACT_APP_ROOM3_URL,
    4: process.env.REACT_APP_ROOM4_URL,
    5: process.env.REACT_APP_ROOM5_URL,
    6: process.env.REACT_APP_ROOM6_URL,
    7: process.env.REACT_APP_ROOM7_URL,
  };
  const PATH = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${PATH}/schedule/room/${number}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке событий');
        }
        const data = await response.json();
        const formattedEvents = data.map(event => ({
          number:parseInt(number,10),
          name: event.name,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          id: event.id, 
        }));
        setEvents(formattedEvents);
        if (check === 'true') {
          const now = new Date();
          const currentEvent = formattedEvents.find(event => now >= event.start && now <= event.end);
          if (currentEvent) {
            const join = window.confirm(`Сейчас проходит: ${currentEvent.title}. Хотите присоединиться?`);
            if (join) {
              const roomUrl = roomUrls[number];
              if (roomUrl) {
                window.location.href = roomUrl;
              } else {
                alert('Ссылка для этой комнаты недоступна.');
              }
            }
          }
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить события с сервера');
      }
    };
    fetchEvents();
  }, [number, check]);

  const handleAddEvent = async () => {
    const start = new Date(eventStart);
    const end = new Date(eventEnd);
    const num = parseInt(number, 10);
    const newEvent = { number: num, name: eventName, title: eventTitle, start, end };
  
    const conflictingEvent = events.find(event =>
      (start < event.end && end > event.start) 
    );
  
    if (conflictingEvent) {
      const message = `В промежуток с ${moment(conflictingEvent.start).format('HH:mm')} до ${moment(conflictingEvent.end).format('HH:mm')} проходит "${conflictingEvent.title}", ведущий: ${conflictingEvent.name}`;
      setModalMessage(message);
      setModalOpen(true); 
      return; 
    }
  
    try {
      const response = await fetch(PATH+`/schedule/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при добавлении события на сервер');
      }
  
      const result = await response.json();
     
      const successMessage = `Ваше событие "${eventTitle}" с ${moment(start).format('HH:mm')} до ${moment(end).format('HH:mm')} успешно добавлено, ведущий: ${eventName}.`;
      setModalMessage(successMessage);
      setModalOpen(true);

      setEvents([...events, { ...newEvent, id: result.id }]);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось добавить событие на сервер');
    }
  
    setEventTitle('');
    setEventName('');
    setEventStart('');
    setEventEnd('');
  };

  const handleDeleteEvent = async (eventToDelete) => {
    if (window.confirm('Вы уверены, что хотите удалить это событие?')) {
        try {
            const response = await fetch(`${PATH}/schedule/room/${eventToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении события на сервере');
            }

            setEvents(events.filter(event => event.id !== eventToDelete.id));

            const successMessage = `Событие "${eventToDelete.title}" успешно удалено.`;
            setModalMessage(successMessage);
            setModalOpen(true); 

        } catch (error) {
            console.error('Ошибка:', error);
            setModalMessage('Не удалось удалить событие на сервере.');
            setModalOpen(true); 
        }
    }
};


const eventStyleGetter = (event, start, end, isSelected) => {
  
  const backgroundColor = '#3174ad'; // цвет фона события
  const style = {
    backgroundColor,
    borderRadius: '5px',
    color: 'white',
    display: 'flex', // используем flexbox для выравнивания
    flexDirection: 'column', // располагаем элементы вертикально
    alignItems: 'flex-start', // выравниваем элементы по левому краю
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    height: 'auto', // автоматическая высота
    margin: '5px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal', // разрешаем перенос строк
    padding: '5px',
    minHeight: '80px',
  };


  return {
      style,
      title: `${event.title} - ${event.name}`, 
    };
  };

  const handleEventClick = (event) => {
    handleDeleteEvent(event);
  };

  return (
    <div className="App">
      <h2 style={{ textAlign: 'center' }}>Комната номер: {number}</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} style={{ textAlign: 'center' }}>
        <div className="date-inputs">
          <div className="date-input">
            <label>Название мероприятия</label> 
            <input
              type="text"
              placeholder="Название события"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
            </div>
          <div className="date-input">
            <label>ФИО</label> 
            <input
              type="text"
              placeholder="Иванов И.И."
              value={eventName} 
              onChange={(e) => setEventName(e.target.value)} 
              required
            />
          </div>
        </div>
        
        <div className="date-inputs">
          <div className="date-input">
            <label>Дата начала</label>
            <input
              type="datetime-local"
              value={eventStart}
              onChange={(e) => setEventStart(e.target.value)}
              required
            />
          </div>

          <div className="date-input">
            <label>Дата окончания</label>
            <input
              type="datetime-local"
              value={eventEnd}
              onChange={(e) => setEventEnd(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="frame">
          <button className="custom-btn btn-14" type="submit">Добавить</button>
        </div>
      </form>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 850, margin: '25px' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventClick}
        dayLayoutAlgorithm={"no-overlap"}
        step={15}
        messages={{
          allDay: 'Весь день',
          previous: 'Предыдущий',
          next: 'Следующий',
          today: 'Сейчас',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
          agenda: 'Список',
          date: 'Дата',
          time: 'Время',
          event: 'Событие',
          showMore: (total) => `+ ещё ${total}`, 
          noEvents: 'Нет событий в этом диапазоне.',
        }}
        components={{
          event: ({ event }) => (
              <div style={{ padding: '5px' }}>
                  <strong>{event.title}</strong> <br />
                  <em>{event.name}</em>
              </div>
          ),
      }}
      />
      
      <Modal isOpen={modalOpen} message={modalMessage} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default App;
