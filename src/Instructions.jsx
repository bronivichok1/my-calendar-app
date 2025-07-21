import React from 'react';
import './InstructionPage.css'; 
import { useLocation, useNavigate } from 'react-router-dom';


const Instruction = () => {

    const navigate = useNavigate();

  return (
    <div className="instruction-container">
      <div className="instruction-card">
        <h1 className="instruction-title">Инструкция для записи</h1>
        
        <div className="instruction-steps">

        <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Войдите в систему</h3>
              <p>Введите свой логин и пароль сотрудника.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Выберите комнату</h3>
              <p>Из списка выберите комнату.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Выберите дату</h3>
              <p>Нажмите на день, когда вам нужна комната. </p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Выберите время</h3>
              <p>Укажите удобное для вас время начала и окончания мероприятия. Минимальный интервал - 30 минут.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Заполните ваши данные</h3>
              <p>Введите имя ведущего и название мероприятия.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">6</div>
            <div className="step-content">
              <h3>Нажмите "Добавить"</h3>
              <p>После проверки всех данных нажмите кнопку "Добавить" для завершения записи.</p>
            </div>
          </div>
        
        <div className="step">
            <div className="step-number">7</div>
            <div className="step-content">
              <h3>Удаление</h3>
              <p>Для удаления события нажмите на него, в случае отсуствия прав на удаление обратитесь по телефону +375.</p>
            </div>
          </div>

        <div className="step">
            <div className="step-number">8</div>
            <div className="step-content">
              <h3>Внештатные ситуации</h3>
              <p>Если необходимое время занято, попробуйте записаться в другую комнату, если нету комнат с подходящими временными промежутками обратитесь по телефону +375 для решения</p>
            </div>
          </div>
          </div>

        <div className="instruction-footer">
          <button className="start-button"
          onClick={() => navigate('/auth')}
          >Записаться</button>
        </div>
      </div>
    </div>
  );
};

export default Instruction;