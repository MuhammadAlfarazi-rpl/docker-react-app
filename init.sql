CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (Opsional) Tambahkan data dummy
INSERT INTO messages (name, message) VALUES ('Admin', 'Selamat datang di Guestbook!');