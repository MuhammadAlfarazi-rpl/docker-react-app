import { useState, useEffect, useRef} from 'react'; 
import api from './api';
import EmojiPicker from 'emoji-picker-react';
import './App.css';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client'; 

const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const rooms = ['general', 'gaming', 'ngaco'];
  const [currentRoom, setCurrentRoom] = useState('general');
  const [isRoomChanging, setIsRoomChanging] = useState(false);
  const auth = useAuth();
  const name = auth.username;
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);

  const onEmojiClick = (emojiObject) => {
    // Tambahkan emoji ke pesan yang ada
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    // Tutup picker setelah dipilih
    setShowPicker(false);
  };

  const smoothScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const instantScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView(); 
  };

  const fetchMessages = async (room) => {
    try {
      const response = await api.get(`/messages/${room}`); 
      setMessages(response.data); 
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        auth.logout();
      }
    }
  };

  useEffect(() => {
    fetchMessages(currentRoom);
    socket.emit('join_room', currentRoom);

    const handleNewMessage = (incomingMessage) => {
    setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    setTimeout(smoothScrollToBottom, 0);
  };

  const handleOnlineUsers = (users) => {
    setOnlineUsers([...new Set(users)]);
  };

  const handleUserTyping = (username) => {
    setTypingUsers((prev) => [...new Set([...prev, username])]);
  };

  const handleUserStoppedTyping = (username) => {
    setTypingUsers((prev) => prev.filter((user) => user !== username));
  };

  socket.on('new_message', handleNewMessage);
  socket.on('online_users_list', handleOnlineUsers);
  socket.on('user_typing', handleUserTyping);
  socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
    socket.off('new_message', handleNewMessage);
    socket.off('online_users_list', handleOnlineUsers); 
    socket.off('user_typing', handleUserTyping);
    socket.off('user_stopped_typing', handleUserStoppedTyping);
    socket.emit('leave_room', currentRoom);
  };
}, [currentRoom]);

  useEffect(() => {
    if (auth.username) {
      console.log('Mengirim absen sebagai:', auth.username);
      socket.emit('user_joins', auth.username);
    }
  }, [auth.username]);

  useEffect(() => {
  if (messages.length === 0) return;

  if (isRoomChanging) {
    instantScrollToBottom();
    setIsRoomChanging(false); 
  } else {
    smoothScrollToBottom();
  }
}, [messages]);

  const handleRoomChange = (newRoom) => {
  if (newRoom !== currentRoom) {
    setMessages([]); 
    setIsRoomChanging(true); 
    setCurrentRoom(newRoom);
  }
};

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    socket.emit('typing', name, currentRoom);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', name, currentRoom); 
    }, 2000); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await api.post('/messages', { name, message, room: currentRoom }); 
      setMessage('');
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('stop_typing', name, currentRoom); 
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  const otherTypingUsers = typingUsers.filter(user => user !== auth.username);

  return (
    <div className="App-container"> 
      <div className="chat-main">
        <h2>Obrolan: #{currentRoom}</h2>
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
          <div ref={messagesEndRef} />
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
        <div className="room-list-container">
          <h2>Rooms</h2>
          <ul className="room-list">
            {rooms.map((room) => (
              <li 
                key={room} 
                className={`room-item ${room === currentRoom ? 'active' : ''}`}
                onClick={() => handleRoomChange(room)}
              >
                # {room}
              </li>
            ))}
          </ul>
        </div>
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