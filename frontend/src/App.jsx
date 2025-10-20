import { useState, useEffect} from 'react'; 
import api from './api';
import './App.css';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client'; 

const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
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

    socket.on('online_users_list', (users) => {
      const uniqueUsers = [...new Set(users)];
      setOnlineUsers(uniqueUsers);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      socket.off('new_message');
      socket.off('online_users_list'); 
    };
  }, []); 

  useEffect(() => {
    if (auth.username) {
      console.log('Mengirim absen sebagai:', auth.username);
      socket.emit('user_joins', auth.username);
    }
  }, [auth.username]);

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
    <div className="App-container"> 
      <div className="chat-main">
        <div className="chat-header">
          <h1>BuaChat (Login sebagai: {auth.username})</h1>
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

      <div className="online-sidebar">
        <h2>Online ({onlineUsers.length})</h2>
        <ul className="online-list">
          {onlineUsers.map((user) => (
            <li key={user} className="online-user-item">
              <span className="online-indicator"></span> {user}
            </li>
          ))}
        </ul>
        <button onClick={() => auth.logout()} className="logout">Logout</button>
      </div>

    </div>
  );
}

export default App;