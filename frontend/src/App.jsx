import { useState, useEffect } from 'react'; 
import api from './api';
import './App.css';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client'; 

const socket = io('http://localhost:3001');

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

    socket.on('new_message', (incomingMessage) => {
      setMessages((prevMessages) => [incomingMessage, ...prevMessages]);
    });

    return () => {
      socket.off('new_message');
    };
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
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  return (
    <div className="App">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>BuaChat (Login sebagai: {auth.username})</h1>
        <button onClick={() => auth.logout()} style={{height: 'fit-content'}}>Logout</button>
      </div>

      <form onSubmit={handleSubmit} className="guestbook-form">
        <textarea
          placeholder="Ketik BuaChat kamu di sini..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <button type="submit">Kirim Pesan 🚀</button>
      </form>

      <hr />

      <h2>Obrolan:</h2>
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