const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const http = require('http'); 
const { Server } = require('socket.io'); 

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

io.on('connection', (socket) => {
  console.log('⚡ User terhubung:', socket.id);
  socket.on('user_joins', (username) => {
    onlineUsers.set(socket.id, username);
    console.log(username, 'bergabung. Total online:', onlineUsers.size);
    io.emit('online_users_list', Array.from(onlineUsers.values()));
  });

  socket.on('disconnect', () => {
    console.log('🔥 User terputus:', socket.id);
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    console.log(username, 'keluar. Sisa online:', onlineUsers.size);
    io.emit('online_users_list', Array.from(onlineUsers.values()));
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- Route intuk Autentikasi ---

// 1. REGISTER
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username dan password dibutuhkan');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).send('Username sudah digunakan');
    }
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 2. LOGIN 
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).send('Username atau password salah');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).send('Username atau password salah');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- Rouute Pesan ---

app.get('/messages', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { name, message } = req.body;
    const userId = req.user.userId;

    if (!name || !message) {
      return res.status(400).send('Name and message are required');
    }

    const result = await pool.query(
      'INSERT INTO messages (name, message, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, message, userId]
    );

    const newMessage = result.rows[0]; 
    io.emit('new_message', newMessage); 

    res.status(201).json(newMessage); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`BuaChat Server (with sockets) running on port ${PORT}`);
});