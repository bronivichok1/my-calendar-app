import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLocation } from 'react-router-dom'; // Импортируем hook для работы с location
// Настройка локализатора на базе moment
const localizer = momentLocalizer(moment);

function App() {
  // Получение параметра number из URL
  const query = new URLSearchParams(useLocation().search);
  const number = "1";
  number = query.get('number'); // Получаем значение параметра "number"

  // Состояние для хранения событий
  const [events, setEvents] = useState([
    {
      title: 'Лекция 1',
      start: new Date('2024-12-11T10:20:00'),
      end: new Date('2024-12-11T11:20:00'),
    },
    {
      title: 'Лекция 2',
      start: new Date('2024-12-11T13:50:00'),
      end: new Date('2024-12-11T14:50:00'),
    },
    {
      title: 'Лекция 1',
      start: new Date('2024-12-11T10:20:00'),
      end: new Date('2024-12-11T11:20:00'),
    },
    {
      title: 'Лекция 1',
      start: new Date('2024-12-11T10:20:00'),
      end: new Date('2024-12-11T11:20:00'),
    },
    {
      title: 'Лекция 1',
      start: new Date('2024-12-11T10:20:00'),
      end: new Date('2024-12-11T11:20:00'),
    },
  ]);

  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  // Функция для добавления события
  const handleAddEvent = () => {
    const start = new Date(eventStart);
    const end = new Date(eventEnd);
    
    setEvents([...events, { title: eventTitle, start, end }]);
    setEventTitle('');
    setEventStart('');
    setEventEnd('');
  };

  // Функция для проверки текущего события
  const checkCurrentEvent = () => {
    const now = new Date();
    const currentEvent = events.find(event =>
      now >= event.start && now <= event.end
    );
    if (currentEvent) {
      alert(`Сейчас происходит: ${currentEvent.title}`);
    } else {
      alert('Нет текущих событий.');
    }
  };

  return (
    <div className="App">
      <h1>Календарь событий</h1>
      <h2>Переданный параметр: {number}</h2> {/* Отображение числа из URL */}
      <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }}>
        <input
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
      <button onClick={checkCurrentEvent}>Проверить текущее событие</button>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: '50px' }}
      />
    </div>
  );
}

export default App;
