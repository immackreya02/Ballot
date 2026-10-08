require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const { getJwtSecret } = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);

// CORS configuration matching environment-configured frontend origin
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: [allowedOrigin, 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: [allowedOrigin, 'http://localhost:5174', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to request object for easy route access
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/voter-groups', require('./routes/groupRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/voter', require('./routes/voterRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/simulation', require('./routes/simulationRoutes'));

// Basic Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'BALLOT Secure Polling Server',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  socket.on('join-poll', (pollId) => {
    socket.join(`poll:${pollId}`);
  });

  socket.on('leave-poll', (pollId) => {
    socket.leave(`poll:${pollId}`);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Validate JWT_SECRET on startup
  getJwtSecret();
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] BALLOT backend running on http://localhost:${PORT}`);
    console.log(`[Server] Allowed CORS origin: ${allowedOrigin}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
