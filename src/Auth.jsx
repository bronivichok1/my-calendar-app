import React, { useState } from 'react';
import './index.css';

const Auth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL;
    const loginUrl = `${apiUrl}/auth/login`; // Define the full login URL
    const roomListUrl = '/rooms';

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(loginUrl, { // Use the defined loginUrl
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Invalid credentials';
                setError(`Login failed: ${errorMessage}`); // More informative error
                return;
            }

            const userData = await response.json();
            console.log('Login successful:', userData);

            localStorage.setItem('user', JSON.stringify(userData.user));

            window.location.href = roomListUrl;
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to connect to the server.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Auth;
