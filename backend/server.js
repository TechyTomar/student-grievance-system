const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const grievanceRoutes = require('./routes/grievances');

app.use('/api', authRoutes);
app.use('/api/grievances', grievanceRoutes);

// ── Root health check ─────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Student Grievance Management API is running ✅' });
});

// ── Connect to MongoDB & Start Server ─────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
