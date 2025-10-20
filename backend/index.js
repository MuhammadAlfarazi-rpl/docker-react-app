const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // Untuk hash password
const jwt = require('jsonwebtoken'); // Untuk 'Member Card'

const app = express();
app.use(cors());
app.use(express.json());

// Ambil Kunci Rahasia dari environment
const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- FUNGSI SATPAM (Middleware) ---
// Ini akan mengecek 'Member Card' (Token) di setiap permintaan
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

  if (token == null) return res.sendStatus(401); // Tidak ada token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token tidak valid/kedaluwarsa
    req.user = user; // Simpan info user (misal: { userId: 5 }) ke 'req'
    next(); // Lanjutkan ke endpoint
  });
}

// --- Rute Autentikasi ---

// 1. REGISTER (Membuat user baru)
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username dan password dibutuhkan');
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // 23505 adalah kode error 'unique violation' (username sudah ada)
    if (err.code === '23505') {
      return res.status(400).send('Username sudah digunakan');
    }
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 2. LOGIN (Mendapatkan 'Member Card' / Token)
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Cari user
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).send('Username atau password salah');
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).send('Username atau password salah');
    }

    // Buat 'Member Card' (Token)
    // Token ini berisi ID user dan berlaku 1 jam
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- Rute Pesan (Sekarang Dilindungi) ---

// HANYA user yang login (punya token valid) yang bisa lihat pesan
app.get('/messages', authenticateToken, async (req, res) => {
  // Kita pasang 'authenticateToken' di sini sebagai 'Satpam'
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// HANYA user yang login yang bisa kirim pesan
app.post('/messages', authenticateToken, async (req, res) => {
  // 'Satpam' cek token dulu
  try {
    const { name, message } = req.body;
    
    // Kita dapat 'userId' dari 'Satpam' (middleware)
    const userId = req.user.userId; 

    if (!name || !message) {
      return res.status(400).send('Name and message are required');
    }
    
    const result = await pool.query(
      'INSERT INTO messages (name, message, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, message, userId] // Simpan siapa yang mengirim pesan
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server (with auth) running on port ${PORT}`);
});