import { useState, useEffect } from 'react';
import axios from 'axios';

// PENTING: URL API menunjuk ke port backend (3001)
// Saat dijalankan di browser, 'localhost' akan merujuk ke mesin host kamu
const API_URL = 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  // Fungsi untuk mengambil data dari backend
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Ambil data saat komponen pertama kali di-load
  useEffect(() => {
    fetchMessages();
  }, []);

  // Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/messages`, { name, message });
      setName('');
      setMessage('');
      fetchMessages(); // Ambil ulang data setelah submit
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h1>Guestbook Sederhana</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        <button type="submit">Kirim</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h2>Pesan:</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
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