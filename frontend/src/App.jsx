import { useState, useEffect } from 'react';
import api from './api'; 
import './App.css';
import { useAuth } from './AuthContext'; 

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  
  const auth = useAuth(); 
  const name = auth.username;

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages'); 
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        auth.logout();
      }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Pesan tidak boleh kosong!");
      return;
    }
    try {
      await api.post('/messages', { name, message });
      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  return (
    <div className="App">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>BuaCot (Login sebagai: {auth.username})</h1>
        <button onClick={() => auth.logout()} className="logout">Logout</button>
      </div>
      
      <form onSubmit={handleSubmit} className="guestbook-form">
        <textarea
          placeholder="Pesan Anda"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <button type="submit">Kirim Pesan 🚀</button>
      </form>

      <hr />

      <h2>Pesan:</h2>
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            <strong>{msg.name}</strong> 
            <p>{msg.message}</p>
            <small>{new Date(msg.createdat).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;