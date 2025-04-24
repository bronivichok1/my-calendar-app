import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const loginUrl = `${apiUrl}/auth/login`;
  const roomListUrl = '/rooms';
  
  const navigate = useNavigate(); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    let finalUsername = username;

    if (!username.includes('@')) {
      finalUsername = `${username}@bsmu.by`;
    }

    setError('');

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: finalUsername,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Invalid credentials';
        setError(`Login failed: ${errorMessage}`);
        console.error('Login failed:', errorData);
        return;
      }

      console.log('Login successful. Session cookie should be set.');
      navigate(roomListUrl); 

    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            autoComplete="off"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default Auth;
