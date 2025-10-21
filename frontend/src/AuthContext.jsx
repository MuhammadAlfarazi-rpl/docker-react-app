import { createContext, useContext, useState, useEffect } from 'react';
import api from './api'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('avatarUrl') || '/public/uploads/default-avatar.png');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [userId, setUserId] = useState(parseInt(localStorage.getItem('userId')) || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('avatarUrl', avatarUrl);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userId'); 
      setUserId(null);
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('avatarUrl');
      setAvatarUrl('/public/uploads/default-avatar.png');
    }
  }, [token, username, userId, avatarUrl]);

  const login = (newToken, newUsername, newUserId, newAvatarUrl) => {
    setToken(newToken);
    setUsername(newUsername);
    setUserId(newUserId);
    setAvatarUrl(newAvatarUrl);
  };

  const updateAvatar = (newAvatarPath) => {
    setAvatarUrl(newAvatarPath);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, userId, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};