import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

const API_URL = 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      alert("Nama dan Pesan tidak boleh kosong!");
      return;
    }
    try {
      await axios.post(`${API_URL}/messages`, { name, message });
      setName('');
      setMessage('');
      fetchMessages(); 
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  return (
    <div className="App">
      <h1>Guestbook Saja</h1>
      
      <form onSubmit={handleSubmit} className="guestbook-form">
        <input
          type="text"
          placeholder="Nama Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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