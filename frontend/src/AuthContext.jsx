import { createContext, useContext, useState, useEffect } from 'react';
import api from './api'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [userId, setUserId] = useState(parseInt(localStorage.getItem('userId')) || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userId'); 
      setUserId(null);
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token, username]);

  const login = (newToken, newUsername, newUserId) => {
    setToken(newToken);
    setUsername(newUsername);
    setUserId(newUserId);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};