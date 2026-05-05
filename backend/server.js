const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const claimRoutes = require('./routes/claims');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// allow requests from the frontend dev server and production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://campus-lost-found-platform-1.onrender.com',
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// wire up all route groups
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);

// simple health check so you know the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Lost & Found API is running' });
});

// kick off the DB init then start listening
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
