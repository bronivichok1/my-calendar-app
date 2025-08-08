import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import Modal from './Modal.jsx';
import { FaQuestionCircle } from 'react-icons/fa';

moment.locale('ru');
const localizer = momentLocalizer(moment);

function App() {


    const query = new URLSearchParams(useLocation().search);
    const number = query.get('num') || "1";

    const navigate = useNavigate();

    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [events, setEvents] = useState([]);
    const [eventName, setEventName] = useState('');
    const [profileName, setProfileName] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [eventStart, setEventStart] = useState('');
    const [eventEnd, setEventEnd] = useState('');
    const [isStartDateValid, setIsStartDateValid] = useState(false);
    const [isEndDateValid, setIsEndDateValid] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showCancelButton, setShowCancelButton] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [calendarDisplayStates, setCalendarDisplayStates] = useState([
        { view: 'month', date: moment().toDate() },
        { view: 'month', date: moment().add(1, 'months').toDate() },
        { view: 'month', date: moment().add(2, 'months').toDate() }
    ]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
    const [highlightedDate, setHighlightedDate] = useState(null);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [eventTitleError, setEventTitleError] = useState('');
    const [eventNameError, setEventNameError] = useState('');
    const [eventStartError, setEventStartError] = useState('');
    const [eventEndError, setEventEndError] = useState('');
    const [highlightedRange, setHighlightedRange] = useState(null);

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isInitialDayView, setIsInitialDayView] = useState(true);

    const PATH = process.env.REACT_APP_API_URL;
    const formRef = useRef(null);
    const authUrl = '/auth';

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch(`${PATH}/auth/status`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const statusData = await response.json();
                    if (statusData.isAuthenticated) {
                        setIsAuthenticated(true);
                        setCurrentUser({ username: statusData.username, name: statusData.name, title: statusData.title });
                        const nameParts = statusData.name.split(' ');
                        const lastName = nameParts[0];
                        const initials = nameParts.slice(1).map(part => part.charAt(0) + '.').join('');
                        setEventName(`${lastName} ${initials}`);
                        setProfileName(`${lastName} ${initials}`);
                    } else {
                        setIsAuthenticated(false);
                    }
                } else {
                    console.error('Failed to check auth status:', response.status, response.statusText);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoadingAuth(false);
            }
        };

        checkAuthStatus();

    }, [PATH]);

    useEffect(() => {
        if (!isLoadingAuth && !isAuthenticated) {
            console.log('User not authenticated, redirecting to login...');
            navigate(authUrl);
        }
    }, [isLoadingAuth, isAuthenticated, authUrl, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const fetchEvents = async () => {
            try {
                const response = await fetch(`${PATH}/schedule/room/${number}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.log('Session expired or unauthorized, redirecting to login.');
                        setIsAuthenticated(false);
                        return;
                    }
                    throw new Error(`Ошибка при загрузке событий: ${response.statusText}`);
                }
                const data = await response.json();
                const formattedEvents = data.map(event => ({
                    number: parseInt(number, 10),
                    name: event.name,
                    title: event.title,
                    originalTitle: event.title,
                    titleorg: event.titleorg,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    id: event.id,
                }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Ошибка при загрузке событий:', error);
                setModalMessage(`Не удалось загрузить события с сервера: ${error.message}`);
                setModalOpen(true);
            }
        };

        fetchEvents();

        if (eventStart && eventEnd) {
            const start = new Date(eventStart);
            const end = new Date(eventEnd);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              setSelectedSlot({ start, end });
            }
        }
    }, [number, PATH, isAuthenticated,eventStart, eventEnd]);

    const validateDateFormat = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        return regex.test(dateString);
    };

    const handleStartDateChange = (e) => {
        const value = e.target.value;
        setEventStart(value);
        updateHighlightedRange(value, eventEnd);
        setIsStartDateValid(validateDateFormat(value));
        
        if (!value) {
          setEventStartError('Поле не должно быть пустым');
        } else if (!validateDateFormat(value)) {
          setEventStartError('Неверный формат даты(гггг-мм-дд чч:мм)');
        } else {
          setEventStartError('');
          updateCalendarSelection(value, eventEnd); 
        }
      };
      
      const handleEndDateChange = (e) => {
        const value = e.target.value;
        setEventEnd(value);
        updateHighlightedRange(eventStart, value);
        setIsEndDateValid(validateDateFormat(value));
        
        if (!value) {
          setEventEndError('Поле не должно быть пустым');
        } else if (!validateDateFormat(value)) {
          setEventEndError('Неверный формат даты(гггг-мм-дд чч:мм)');
        } else {
          setEventEndError('');
          updateCalendarSelection(eventStart, value); 
        }
      };

      const updateCalendarSelection = (startValue, endValue) => {
        const start = new Date(startValue);
        const end = new Date(endValue);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          setSelectedSlot({ start, end });
        }
      };

    const handleEventTitleChange = (e) => {
        const value = e.target.value;
        setEventTitle(value);
        if (!value) {
            setEventTitleError('Поле не должно быть пустым');
        } else {
            setEventTitleError('');
        }
    };

    const handleEventNameChange = (e) => {
        const value = e.target.value;
        setEventName(value);
        if (!value) {
            setEventNameError('Поле не должно быть пустым');
        } else {
            setEventNameError('');
        }
    };

    const handleAddEvent = async () => {
        let isValid = true;
        if (!eventTitle) {
            setEventTitleError('Поле не должно быть пустым');
            isValid = false;
        }
        if (!eventName) {
            setEventNameError('Поле не должно быть пустым');
            isValid = false;
        }
        if (!eventStart) {
            setEventStartError('Поле не должно быть пустым');
            isValid = false;
        }
        if (!eventEnd) {
            setEventEndError('Поле не должно быть пустым');
            isValid = false;
        }

        if (!isStartDateValid || !isEndDateValid || !eventTitle || !eventName || !currentUser) {
            if (!currentUser) {
                setModalMessage('Не удалось получить данные пользователя. Пожалуйста, попробуйте войти снова.');
                setIsAuthenticated(false);
            } else {
                setModalMessage('Пожалуйста, заполните все поля и введите дату в правильном формате (гггг-мм-дд чч:мм).');
            }
            setModalOpen(true);
            return;
        }
        if (!isValid) {
            return;
        }

        if (!isStartDateValid || !isEndDateValid || !eventTitle || !eventName || !currentUser) {
            if (!currentUser) {
                setModalMessage('Не удалось получить данные пользователя. Пожалуйста, попробуйте войти снова.');
                setIsAuthenticated(false);
            } else {
                setModalMessage('Пожалуйста, заполните все поля и введите дату в правильном формате (гггг-мм-дд чч:mm).');
            }
            setModalOpen(true);
            return;
        }

        const titleOrg = currentUser.title;

        const start = new Date(eventStart);
        const end = new Date(eventEnd);
        const num = parseInt(number, 10);

        const startTime = moment(start);
        const endTime = moment(end);

        if (start >= end) {
            setModalMessage('Дата окончания должна быть позже даты начала.');
            setModalOpen(true);
            return;
        }

        const durationInMinutes = endTime.diff(startTime, 'minutes');
        if (durationInMinutes < 30) {
            setModalMessage('Минимальная длительность события - 30 минут.');
            setModalOpen(true);
            return;
        }
        /*if (durationInMinutes > 180) {
            setModalMessage('Максимальная длительность события - 3 часа.');
            setModalOpen(true);
            return;
        }*/

        const nowWithBuffer = moment().subtract(1, 'minute');
        if (startTime.isBefore(nowWithBuffer)) {
            setModalMessage('Нельзя добавить событие на прошедшую дату или время.');
            setModalOpen(true);
            return;
        }

        const minAllowedTime = moment(start).clone().startOf('day').add(7, 'hours');
        if (startTime.isBefore(minAllowedTime)) {
            setModalMessage('Недопустимое время начала события. События могут начинаться только с 07:00.');
            setModalOpen(true);
            return;
        }

        const maxAllowedEndBoundary = moment(start).clone().startOf('day').add(23, 'hours');
        if (endTime.isAfter(maxAllowedEndBoundary)) {
            setModalMessage('Недопустимое время окончания события. События могут заканчиваться только до 23:00.');
            setModalOpen(true);
            return;
        }

        const conflictingEvent = events.find(event =>
            (startTime.isBefore(moment(event.end)) && endTime.isAfter(moment(event.start)))
        );

        if (conflictingEvent) {
            const message = `В промежуток с ${moment(conflictingEvent.start).format('HH:mm')} до ${moment(conflictingEvent.end).format('HH:mm')} проходит "${conflictingEvent.originalTitle}", ведущий: ${conflictingEvent.name}`;
            setModalMessage(message);
            setModalOpen(true);
            return;
        }

        const newEvent = {
            number: num,
            name: eventName,
            title: eventTitle,
            titleorg: titleOrg,
            start,
            end
        };

        try {
            const response = await fetch(PATH + `/schedule/room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newEvent),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Session expired or unauthorized on add event, redirecting to login.');
                    setIsAuthenticated(false);
                    return;
                }
                const errorBody = await response.text();
                let errorMessage = 'Ошибка при добавлении события на сервер';
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = `Ошибка при добавлении события на сервере: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            const eventForDisplay = {
                ...newEvent,
                id: result.id,
                originalTitle: newEvent.title
            };
            const successMessage = `Ваше событие "${eventForDisplay.originalTitle}" с ${moment(start).format('DD.MM.YYYY HH:mm')} до ${moment(end).format('DD.MM.YYYY HH:mm')} успешно добавлено, ведущий: ${eventName}.`;
            setModalMessage(successMessage);
            setModalOpen(true);
            setEvents([...events, eventForDisplay]);
        } catch (error) {
            console.error('Ошибка при добавлении события:', error);
            setModalMessage(error.message || 'Не удалось добавить событие на сервер.');
            setModalOpen(true);
        } finally {
            setSelectedSlot(null);
            setEventTitle('');
            setHighlightedDate(null);
            setSelectedDate(null);
        }
    };

    const handleDeleteEvent = async () => {
        if (!eventToDelete || !currentUser) return;

        const userTitle = currentUser.title;
        const creatorTitle = eventToDelete.titleorg;

        const userLevel = getTitleLevel(userTitle);
        const creatorLevel = getTitleLevel(creatorTitle);

        if (userLevel == -1 || creatorLevel == -1) {
            setModalMessage('Не удалось определить должность для проверки прав на удаление.');
            setModalOpen(true);
            setEventToDelete(null);
            setShowCancelButton(false);
            return;
        }

        if (userTitle !== creatorTitle && userLevel > creatorLevel) {
            setModalMessage('У вас нет прав для удаления этого события.');
            setModalOpen(true);
            setEventToDelete(null);
            setShowCancelButton(false);
            return;
        }

        try {
            const response = await fetch(`${PATH}/schedule/room/${eventToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Session expired or unauthorized on delete event, redirecting to login.');
                    setIsAuthenticated(false);
                    return;
                }
                const errorBody = await response.text();
                let errorMessage = 'Ошибка при удалении события на сервере';
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = `Ошибка при удалении события на сервере: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            setEvents(events.filter(event => event.id !== eventToDelete.id));
            const successMessage = `Событие "${eventToDelete.originalTitle || eventToDelete.title}" успешно удалено.`;
            setModalMessage(successMessage);
            setModalOpen(true);
        } catch (error) {
            console.error('Ошибка при удалении события:', error);
            setModalMessage(error.message || 'Не удалось удалить событие на сервер.');
            setModalOpen(true);
        } finally {
            setEventToDelete(null);
            setShowCancelButton(false);
        }
    };

    const handleCancelDelete = () => {
        setModalOpen(false);
        setModalMessage('');
        setShowCancelButton(false);
        setEventToDelete(null);
    };

    const getTitleLevel = (title) => {
        if (!title) {
            console.warn('Информация о должности пользователя отсутствует.');
            return -1;
        }

        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('admin')) return 1;
        if (lowerTitle.includes('ректор')) return 1;
        if (lowerTitle.includes('декан')) return 2;
        if (/\b(зам|нач)\w*\b/.test(lowerTitle) || lowerTitle.includes('заместитель') || lowerTitle.includes('начальник')) return 3;
        return 4;
    };

    const initiateDelete = (event) => {
        if (!currentUser) {
            setModalMessage('Ошибка: Не удалось получить данные пользователя для проверки прав.');
            setModalOpen(true);
            return;
        }

        const userTitle = currentUser.title;
        const creatorTitle = event.titleorg;

        const userLevel = getTitleLevel(userTitle);
        const creatorLevel = getTitleLevel(creatorTitle);

        if (userLevel == -1 || creatorLevel == -1) {
            setModalMessage('Ошибка: Не удалось определить уровень доступа для проверки прав на удаление.');
            setModalOpen(true);
            return;
        }

        if (userTitle == creatorTitle || creatorLevel <= userLevel) {
            setEventToDelete(event);
            setModalMessage(`Вы уверены, что хотите удалить событие "${event.originalTitle || event.title}"?`);
            setShowCancelButton(true);
            setModalOpen(true);
        } else {
            setModalMessage('У вас нет прав для удаления этого события, попробуйте возспользоваться кнопкой "Помощь".');
            setModalOpen(true);
        }
    };


    const handleSlotSelectAndSwitchView = (slotInfo, monthIndex) => {
        const selectedMomentStart = moment(slotInfo.start);
        const now = moment();
        const currentCalendarView = calendarDisplayStates[monthIndex].view;
    
        if (currentCalendarView === 'month' && selectedMomentStart.isBefore(now, 'day')) {
            return;
        }
    
        if (currentCalendarView === 'month') {
            setCalendarDisplayStates(prevStates => {
                const newStates = [...prevStates];
                newStates[monthIndex] = { view: 'day', date: selectedMomentStart.toDate() };
                return newStates;
            });
            
            setIsFormVisible(true);
            setSelectedSlot(null);
            setEventStart('');
            setEventEnd('');
            setSelectedMonthIndex(monthIndex);
            setHighlightedDate(selectedMomentStart.toDate());
            return;
        }
    
        if (currentCalendarView === 'day') {
            const nowWithBuffer = moment().subtract(1, 'minute');
            if (selectedMomentStart.isBefore(nowWithBuffer)) {
                return;
            }
    
            const formattedStartDate = selectedMomentStart.format('YYYY-MM-DD HH:mm');
            const formattedEndDate = moment(slotInfo.end).format('YYYY-MM-DD HH:mm');
    
            setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
            setEventStart(formattedStartDate);
            setEventEnd(formattedEndDate);
            setIsStartDateValid(validateDateFormat(formattedStartDate));
            setIsEndDateValid(validateDateFormat(formattedEndDate));
            setEventEndError(false)
            setEventStartError(false)
        }
    };

    const handleBackToMonth = (monthIndex) => {
        setIsInitialDayView(true);
        setSelectedSlot(null);
        setEventEndError(false)
        setEventStartError(false)
        setEventNameError(false)
        setEventTitleError(false)
        setCalendarDisplayStates(prevStates => {
            const newStates = [...prevStates];
            newStates[monthIndex] = { view: 'month', date: moment().add(monthIndex, 'months').startOf('month').toDate() };
            return newStates;
        });

        if (selectedMonthIndex === monthIndex) {
            setIsFormVisible(false);
            setHighlightedDate(null);
            setSelectedDate(null);
            setSelectedMonthIndex(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch(`${PATH}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Logout failed on server:', response.statusText);
            }

        } catch (error) {
            console.error('Error during logout request:', error);
        } finally {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
    };

    const Event = ({ event }) => {
        const durationInMinutes = moment(event.end).diff(moment(event.start), 'minutes');

        const showLineBreakForName = durationInMinutes >= 45;

        const specialSpacing = '15px';
        const defaultSpacing = '0px';

        const needsSpecialSpacing = durationInMinutes >= 30 && durationInMinutes < 45;

        const titleSpanStyle = {
            marginLeft: needsSpecialSpacing ? specialSpacing : defaultSpacing
        };

        const nameSpanStyle = {};
        if (event.name && !showLineBreakForName) {
            nameSpanStyle.marginLeft = needsSpecialSpacing ? specialSpacing : defaultSpacing;
        }


        const timeString = `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`;

        return (
            <div className="rbc-event-content">

                <span style={titleSpanStyle}>

                    <strong>{event.originalTitle}</strong>
                </span>

                {event.name && (
                    <>
                        {showLineBreakForName && <br />}
                        <span style={nameSpanStyle}>
                            {event.name}
                        </span>
                    </>
                )}
            </div>
        );
    };


    const isAnyCalendarInDayView = calendarDisplayStates.some(state => state.view === 'day');

    if (isLoadingAuth) {
        return <div className="loading-container">Проверка аутентификации...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleOpenHelpModal = () => {
        setHelpModalOpen(true);
    };

    const handleCloseHelpModal = () => {
        setHelpModalOpen(false);
    };
    
    const updateHighlightedRange = (start, end) => {
      if (start && end && validateDateFormat(start) && validateDateFormat(end)) {
        const startDate = moment(start);
        const endDate = moment(end);
    
        if (startDate.isBefore(endDate)) {
          setHighlightedRange({ start: startDate.toDate(), end: endDate.toDate() });
        } else {
          setHighlightedRange(null);
        }
      } else {
        setHighlightedRange(null);
      }
    };

    const handleInstructionClick = () => {
        navigate('/instruction');
    };

    return (
        <div className="App">
            {!isAnyCalendarInDayView && (
            <button 
            onClick={handleInstructionClick}
            className="help-button"
            title="Инструкция"
            >
            <FaQuestionCircle size={24} />
            </button>
            )}
            {!isAnyCalendarInDayView && (
                
                <div className="header">
                    <button
                        onClick={() => navigate('/videokonferentssvyaz')}
                        className="room-list-button"
                    >
                        Главная
                    </button>
                    {/*<button
                        onClick={() => navigate('/rooms')}
                        className="room-list-button"
                    >
                        Список кабинетов
                    </button>*/}
                    <h1 className="header-title">
                        {number == 6 ? 'Совет университета' : `Кабинет №${number}`}
                    </h1>
                    <div className="header-info">
                        <span className="event-name">{profileName}</span>
                        <button onClick={handleLogout} className="logout-button">Выход</button>
                    </div>
                </div>
            )}

            {[...Array(3)].map((_, index) => {
                const { view, date } = calendarDisplayStates[index];
                const isDayView = view === 'day';
                const isVisible = isAnyCalendarInDayView ? isDayView : true;
                
                const dayPropGetter = (date) => {
                    const momentDate = moment(date);
                    let className = '';
                    const now = moment();
                    
                    if (highlightedRange) {
                        const start = moment(highlightedRange.start);
                        const end = moment(highlightedRange.end);
                        if (momentDate.isBetween(start, end, null, '[]')) {
                            className += ' highlighted-range';
                        }
                    }
                    
                    if (!momentDate.isBefore(now, 'day')) {
                        const hasEvents = events.some(
                            (event) =>
                                moment(event.start).isSame(date, 'day') ||
                                moment(event.end).isSame(date, 'day')
                        );
                        
                        if (hasEvents) {
                            className += ' has-event'; 
                        }
                    }
                    
                    if (momentDate.isBefore(now, 'day')) {
                        className += ' past-day';
                    } else {
                        const calendarViewDate = moment(calendarDisplayStates[index].date);
                        if (
                            calendarDisplayStates[index].view === 'day' &&
                            momentDate.isSame(calendarViewDate, 'day')
                        ) {
                            className += ' active-day';
                        }
                        if (
                            !isDayView &&
                            selectedMonthIndex === index &&
                            highlightedDate &&
                            momentDate.isSame(highlightedDate, 'day')
                        ) {
                            className += ' highlighted-date';
                        }
                        if (
                            !isDayView &&
                            momentDate.isSame(calendarDisplayStates[index].date, 'month')
                        ) {
                            if (!momentDate.isBefore(now, 'day')) {
                                className += ' selectable-day';
                            }
                        }
                    }
                    
                    return { className: className.trim() };
                };
                return isVisible ? (
                    <div key={index} style={{ margin: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 25px 10px' }}>
                            {!isDayView && (
                                <h2 style={{ textAlign: 'center', fontWeight: 'bold', flexGrow: 1 }}>
                                    {moment(date).format('MMMM YYYY').charAt(0).toUpperCase() + moment(date).format('MMMM YYYY').slice(1)}
                                </h2>
                            )}
                            {isDayView && (
                                <>
                                    <div style={{ width: '' }}></div>
                                    <button onClick={handleOpenHelpModal} className="btn-help">
                                        <span>Помощь</span>
                                    </button>
                                    <h2 style={{ textAlign: 'center', fontWeight: 'bold', flexGrow: 1 }}>
                                        {moment(date).format('DD MMMM YYYY')}
                                    </h2>
                                    <button onClick={() => handleBackToMonth(index)} className="btn-back">
                                        Назад
                                    </button>
                                </>
                            )}
                        </div>

                        <Calendar
                            toolbar={false}
                            localizer={localizer}
                            events={isDayView ? events.filter(event => moment(event.start).isSame(date, 'day')) : []}
                            startAccessor="start"
                            endAccessor="end"
                            step={15}
                            min={new Date(0, 0, 0, 7, 0, 0)}
                            max={new Date(0, 0, 0, 23, 0, 0)}
                            style={{
                                height: isDayView ? 500 : 500,
                                width: '75%',
                                margin: '0 auto',
                            }}
                            views={['month', 'day']}
                            defaultView="month"
                            view={view}
                            date={date}
                            onView={(newView) => {
                                setCalendarDisplayStates(prevStates => {
                                    const newStates = [...prevStates];
                                    newStates[index] = { ...newStates[index], view: newView };
                                    return newStates;
                                });
                            }}
                            onNavigate={(newDate) => {
                                setCalendarDisplayStates(prevStates => {
                                    const newStates = [...prevStates];
                                    newStates[index] = { ...newStates[index], date: newDate };
                                    return newStates;
                                });
                            }}

                            selectable={true}
                            onSelectSlot={(slotInfo) => handleSlotSelectAndSwitchView(slotInfo, index)}
                            onTouchStart={(slotInfo) => handleSlotSelectAndSwitchView(slotInfo, index)}
                            onSelectEvent={initiateDelete}
                            dayPropGetter={dayPropGetter}
                            components={{
                                event: Event,
                            }}
                            messages={{
                                allDay: 'Весь день',
                                previous: 'Предыдущий',
                                next: 'Следующий',
                                today: 'Сегодня',
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
                            slotPropGetter={(date, resourceId, isSelected) => {
                                const momentDate = moment(date);
                                let className = 'rbc-custom-slot';
                                
                                const isTimeColumn = resourceId === undefined;
                                const isPast = momentDate.isBefore(moment(), 'hour');
                                
                                // Добавляем класс для прошедшего времени
                                if (isPast) {
                                  className += ' rbc-past-slot';
                                }
                                
                                if (!isTimeColumn && selectedSlot) {
                                  const isInSelectedRange = momentDate.isBetween(
                                    moment(selectedSlot.start),
                                    moment(selectedSlot.end),
                                    null,
                                    '[)'
                                  );
                                  
                                  if (isInSelectedRange) {
                                    className += ' rbc-selected-slot';
                                  }
                                }
                                
                                if (isTimeColumn) {
                                  className += ' rbc-time-column-slot';
                                }
                                
                                return { className };
                              }}
                        />

                        {isFormVisible && selectedMonthIndex === index && (
                            <div ref={formRef} className={`event-form-container ${isFormVisible ? 'visible' : ''}`}
                                style={{
                                    width: '75%',
                                    margin: '20px auto',
                                    textAlign: 'center',
                                    padding: '20px',
                                    backgroundColor: '#f9f9f9',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    transition: 'opacity 0.3s ease-in-out',
                                    opacity: isFormVisible ? 1 : 0,
                                    pointerEvents: isFormVisible ? 'auto' : 'none'
                                }}
                            >
                                <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }}
                                    style={{
                                        textAlign: 'center',
                                    }}
                                >
                                    <div className="date-inputs" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                                        <div className="date-input" style={{ flex: 1, marginRight: '10px' }}>
                                            <label>Название мероприятия</label>
                                            <input
                                                type="text"
                                                placeholder="Название события"
                                                value={eventTitle}
                                                onChange={handleEventTitleChange}
                                                className={eventTitleError ? 'input-error' : ''}
                                            />
                                            {eventTitleError && <p className="error-message">{eventTitleError}</p>}
                                        </div>
                                        <div className="date-input" style={{ flex: 1, marginLeft: '10px' }}>
                                            <label>ФИО</label>
                                            <input
                                                type="text"
                                                placeholder="Иванов И.И."
                                                value={eventName}
                                                onChange={handleEventNameChange}
                                                className={eventNameError ? 'input-error' : ''}
                                            />
                                            {eventNameError && <p className="error-message">{eventNameError}</p>}
                                        </div>
                                    </div>
                                    <div className="date-inputs" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                                        <div className="date-input" style={{ flex: 1, marginRight: '10px' }}>
                                            <label>Дата начала</label>
                                            <input
                                                type="text"
                                                placeholder="гггг-мм-дд чч:mm"
                                                value={eventStart}
                                                onChange={handleStartDateChange}
                                                onFocus={() => updateCalendarSelection(eventStart, eventEnd)}
                                                className={(eventStartError) ? 'input-error' : ''}
                                            />
                                            {eventStartError && <p className="error-message">{eventStartError}</p>}
                                        </div>
                                        <div className="date-input" style={{ flex: 1, marginLeft: '10px' }}>
                                            <label>Дата окончания</label>
                                            <input
                                                type="text"
                                                placeholder="гггг-мм-дд чч:mm"
                                                value={eventEnd}
                                                onChange={handleEndDateChange}
                                                onFocus={() => updateCalendarSelection(eventStart, eventEnd)}
                                                className={(eventEndError) ? 'input-error' : ''}
                                            />
                                            {eventEndError && <p className="error-message">{eventEndError}</p>}
                                        </div>
                                    </div>
                                    <div className="frame" style={{ marginTop: '20px' }}>
                                        <button
                                            className="custom-btn btn-14"
                                            type="submit"
                                        >
                                            Добавить
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                ) : null;
            })}

            <Modal
                isOpen={modalOpen}
                message={modalMessage}
                showCancelButton={showCancelButton}
                onClose={() => {
                    if (showCancelButton) {
                        handleDeleteEvent();
                    } else {
                        setModalOpen(false);
                        setModalMessage('');
                    }
                }}
                onCancel={handleCancelDelete}
            />
            <Modal
                isOpen={helpModalOpen}
                message="Для удаления события нажмите на него, если у вас не хватает прав обратитесь по телефону 364-26-07."
                onClose={handleCloseHelpModal}
                showCancelButton={false}
            />
        </div>
    );
}

export default App;