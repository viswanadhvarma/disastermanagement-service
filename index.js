const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // create server first

const port = process.env.PORT || 5000;

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Setup Socket.IO AFTER creating HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
app.set('io', io);

// Import routes
const disasterRoutes = require('./routes/disasters');
const geocodeRoutes = require('./routes/geocode');
const resourceRoutes = require('./routes/resources')(io);
const reportRoutes = require('./routes/reports');
const cacheRoutes = require('./routes/cache');
const officialUpdateRoutes = require('./routes/officialUpdates');
const verifyRoutes = require('./routes/verify');
const extractLocationRoutes = require('./routes/extract-location');
const socialRoutes = require('./routes/social')(io); // pass io here
const scrapeRoutes = require('./routes/scrape');

// Test route
app.get('/', (req, res) => {
  res.send('🚨 Disaster Response API is running!');
});

// Just for checking disasters from browser
app.get('/disasters', async (req, res) => {
  const { data, error } = await supabase.from('disasters').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Setup WebSocket events
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Use routes
app.use('/disasters', disasterRoutes);
app.use('/geocode', geocodeRoutes);
app.use('/resources', resourceRoutes);
app.use('/reports', reportRoutes);
app.use('/cache', cacheRoutes);
app.use('/official-updates', officialUpdateRoutes);
app.use('/disasters', verifyRoutes);
app.use('/extract-location', extractLocationRoutes);
app.use('/social', socialRoutes); // this was fixed
app.use('/scrape', scrapeRoutes);

// Start the server (listen using HTTP server, not app)
server.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
