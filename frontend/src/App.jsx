import { useState, useEffect, useRef} from 'react'; 
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
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

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

    socket.on('user_typing', (username) => {
      setTypingUsers((prev) => [...new Set([...prev, username])]);
    });

    socket.on('user_stopped_typing', (username) => {
      setTypingUsers((prev) => prev.filter((user) => user !== username));
    });

    return () => {
      socket.off('new_message');
      socket.off('online_users_list'); 
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, []); 

  useEffect(() => {
    if (auth.username) {
      console.log('Mengirim absen sebagai:', auth.username);
      socket.emit('user_joins', auth.username);
    }
  }, [auth.username]);

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    socket.emit('typing', name);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', name);
    }, 2000); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Pesan tidak boleh kosong!");
      return;
    }
    try {
      await api.post('/messages', { name, message });
      setMessage('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('stop_typing', name);
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  const otherTypingUsers = typingUsers.filter(user => user !== auth.username);

  return (
    <div className="App-container"> 
      <div className="chat-main">
        <div className="chat-header">
          <h1>BuaChat (Login sebagai: {auth.username})</h1>
        </div>
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg.id} className="message-item">
              <strong>{msg.name}</strong>
              <p>{msg.message}</p>
              <small>{new Date(msg.createdat).toLocaleString()}</small>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="guestbook-form">
          <textarea
            placeholder="Ketik BuaChat-an kamu di sini..."
            value={message}
            onChange={handleTyping}
            required
          ></textarea>
         <button type="submit" title="Kirim Pesan">🚀</button>
        </form>
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
        <div className="typing-indicator">
          {otherTypingUsers.length > 0 && (
            <i>
              {otherTypingUsers.join(', ')} 
              {otherTypingUsers.length === 1 ? ' lagi ngetik...' : ' lagi ngetik...'}
            </i>
          )}
        </div>
        <button onClick={() => auth.logout()} className="logout">Logout</button>
      </div>

    </div>
  );
}

export default App;