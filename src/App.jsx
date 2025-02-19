import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLocation } from 'react-router-dom';

const localizer = momentLocalizer(moment);

function App() {
  const query = new URLSearchParams(useLocation().search);
  const number = query.get('num') || "1";
  const check = query.get('ch') || 'false';

  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  const roomUrls = {
    1: process.env.REACT_APP_ROOM1_URL,
    2: process.env.REACT_APP_ROOM2_URL,
    3: process.env.REACT_APP_ROOM3_URL,
    4: process.env.REACT_APP_ROOM4_URL,
    5: process.env.REACT_APP_ROOM5_URL,
    6: process.env.REACT_APP_ROOM6_URL,
    7: process.env.REACT_APP_ROOM7_URL,
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:3000/schedule/room${number}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке событий');
        }
        const data = await response.json();
        const formattedEvents = data.map(event => ({
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
    const newEvent = { title: eventTitle, start, end };

    try {
      const response = await fetch(`http://localhost:3000/schedule/room${number}`, {
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
      console.log('Событие добавлено на сервер:', result);
      setEvents([...events, { ...newEvent, id: result.id }]);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось добавить событие на сервер');
    }

    setEventTitle('');
    setEventStart('');
    setEventEnd('');
  };

  const handleDeleteEvent = async (eventToDelete) => {
    if (window.confirm('Вы уверены, что хотите удалить это событие?')) {
      try {
        const response = await fetch(`http://localhost:3000/schedule/room${number}/${eventToDelete.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Ошибка при удалении события на сервере');
        }
        setEvents(events.filter(event => event.id !== eventToDelete.id));
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить событие на сервере');
      }
    }
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: '#3174ad',
      border: 'none',
      color: 'white',
      borderRadius: '5px',
      padding: '10px',
      cursor: 'pointer',
    };
    return { style };
  };

  const handleEventClick = (event) => {
    handleDeleteEvent(event);
  };

  return (
    <div className="App">
      <h2>Комната: {number}</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }}>
        <input
          className='input_1'
          type="text"
          placeholder="Название события"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={eventStart}
          onChange={(e) => setEventStart(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={eventEnd}
          onChange={(e) => setEventEnd(e.target.value)}
          required
        />
        <button type="submit">Добавить событие</button>
      </form>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '25px' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventClick}
        messages={{
          allDay: 'Весь день',
          previous: '<',
          next: '>',
          today: 'Сегодня',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
          agenda: 'Список',
          date: 'Дата',
          time: 'Время',
          event: 'Событие',
          showMore: (total) => `+ ещё ${total}`, // показывает, сколько событий осталось
        }}
      />
    </div>
  );
}

export default App;
