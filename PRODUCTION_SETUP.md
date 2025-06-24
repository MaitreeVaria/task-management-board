# Production Deployment Guide

## Overview
This guide covers the steps to deploy your Task Management Board to the EC2 server with Google OAuth authentication.

## Prerequisites
- EC2 instance running Ubuntu/Amazon Linux
- PostgreSQL installed and configured
- Node.js and npm installed
- PM2 installed globally (`npm install -g pm2`)
- Git repository cloned on the server

## 1. Environment Variables Setup

Create a `.env` file in the `backend` directory on your EC2 server:

```bash
# Production Environment Variables
NODE_ENV=production
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskboard
DB_USER=your_actual_db_user
DB_PASSWORD=your_actual_db_password

# Session Configuration
SESSION_SECRET=your_very_secure_session_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 2. Google OAuth Configuration

In your Google Cloud Console:
1. Go to APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add these Authorized redirect URIs:
   - `http://ec2-3-129-45-165.us-east-2.compute.amazonaws.com/auth/google/callback`
   - `https://ec2-3-129-45-165.us-east-2.compute.amazonaws.com/auth/google/callback` (if using HTTPS)

## 3. Database Setup

Ensure your PostgreSQL database has the required tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE user_sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE user_sessions ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IDX_session_expire ON user_sessions (expire);
```

## 4. PM2 Configuration

Create a `ecosystem.config.js` file in the root directory:

```javascript
module.exports = {
  apps: [{
    name: 'task-board-backend',
    script: './backend/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

## 5. Nginx Configuration (Optional)

If you want to serve the frontend through Nginx, create a configuration:

```nginx
server {
    listen 80;
    server_name ec2-3-129-45-165.us-east-2.compute.amazonaws.com;

    # Serve static frontend files
    location / {
        root /home/ec2-user/task-management-board/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy auth requests to Node.js backend
    location /auth/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. Deployment Commands

After pushing your code to GitHub, the Azure pipeline will automatically deploy. You can also deploy manually:

```bash
# On your EC2 server
cd /home/ec2-user/task-management-board
git pull origin main

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && NODE_ENV=production npm run build

# Restart PM2
pm2 restart all
```

## 7. Security Considerations

1. **Environment Variables**: Never commit `.env` files to Git
2. **HTTPS**: Consider setting up SSL/TLS certificates for production
3. **Firewall**: Ensure only necessary ports are open (80, 443, 22)
4. **Database**: Use strong passwords and limit database access
5. **Session Security**: Use a strong, unique session secret

## 8. Monitoring

Use PM2 for process monitoring:
```bash
pm2 status          # Check process status
pm2 logs            # View logs
pm2 monit           # Monitor resources
```

## 9. Troubleshooting

### Common Issues:
1. **CORS errors**: Check that the frontend URL is in the allowed origins
2. **Database connection**: Verify database credentials and connectivity
3. **OAuth callback**: Ensure redirect URIs match exactly
4. **Session issues**: Check that session secret is set and consistent

### Logs:
- Backend logs: `pm2 logs task-board-backend`
- Nginx logs: `/var/log/nginx/error.log` and `/var/log/nginx/access.log` 