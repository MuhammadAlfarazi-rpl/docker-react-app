const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors()); // Mengizinkan Cross-Origin requests
app.use(express.json()); // Middleware untuk parse JSON body

// Konfigurasi koneksi database
// Ambil dari environment variables yang akan di-set oleh Docker Compose
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, // Ini akan menjadi nama service 'db' di Docker
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Endpoint untuk mengambil semua pesan
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Endpoint untuk mengirim pesan baru
app.post('/messages', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).send('Name and message are required');
    }
    const result = await pool.query(
      'INSERT INTO messages (name, message) VALUES ($1, $2) RETURNING *',
      [name, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});