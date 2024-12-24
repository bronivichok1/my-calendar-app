import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLocation } from 'react-router-dom';

const localizer = momentLocalizer(moment);

function App() {
  const query = new URLSearchParams(useLocation().search);
  const number = query.get('number') || "1"; // Получаем значение параметра "number"
  const check = query.get('check') || 'true'; // Получаем значение параметра "check"

  // Состояние для хранения событий
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  // useEffect для загрузки событий с сервера при монтировании компонента
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:3000/schedule/room${number}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке событий');
        }
        const data = await response.json();
        setEvents(data);

        if (check==='true') {
          // Проверка текущего события
          const now = new Date();
          const currentEvent = data.find(event => now >= new Date(event.start) && now <= new Date(event.end));
          if (currentEvent) {
            const join = window.confirm(`Сейчас проходит: ${currentEvent.title}. 
              Хотите присоединиться?`);
            if (join) {
              window.location.href = `http://example.com/room/${number}`; // Замените на нужный вам URL
            }
          }
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить события с сервера');
      }
    };

    fetchEvents();
  }, [number, check]); // Выполняется один раз после монтирования и всякий раз, когда number или check изменяются

  // Функция для добавления события
  const handleAddEvent = async () => {
    const start = new Date(eventStart);
    const end = new Date(eventEnd);

    // Обновляем локальное состояние
    const newEvent = { title: eventTitle, start, end };
    setEvents([...events, newEvent]);

    // Отправляем POST запрос на сервер для сохранения события
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
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось добавить событие на сервер');
    }

    // Очистить поля формы
    setEventTitle('');
    setEventStart('');
    setEventEnd('');
  };

  // Функция для проверки текущего события
  const checkCurrentEvent = () => {
    const now = new Date();
    const currentEvent = events.find(event => now >= new Date(event.start) && now <= new Date(event.end));
    if (currentEvent) {
      alert(`Сейчас происходит: ${currentEvent.title}`);
    } else {
      alert('Нет текущих событий.');
    }
  };

  return (
    <div className="App">
      <h1>Календарь событий</h1>
      <h2>Комната: {number}</h2>
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