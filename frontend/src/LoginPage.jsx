import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './App.css'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const payload = { username, password };

    try {
      if (isRegistering) {
        await api.post(endpoint, payload);
        alert('Registrasi sukses! Silakan login.');
        setIsRegistering(false); 
      } else {
        const response = await api.post(endpoint, payload);
        const { token, username } = response.data;
        auth.login(token, username); 
        navigate('/'); 
      }
    } catch (err) {
      setError(err.response?.data || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="login-container"> 
      <h1>{isRegistering ? 'Register BuaChat' : 'Login BuaChat'}</h1>
      
      <form onSubmit={handleSubmit} className="guestbook-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button typeS="submit">{isRegistering ? 'Register' : 'Login'}</button>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </form>
      
      <button 
        onClick={() => setIsRegistering(!isRegistering)}
        className="toggle-auth" 
      >
        {isRegistering ? 'Sudah punya akun? Login di sini' : 'Belum punya akun? Register di sini'}
      </button>
    </div>
  );
}

export default LoginPage;