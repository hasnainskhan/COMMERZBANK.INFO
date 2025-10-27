# Docker Setup for Commerzbank Application

This document provides comprehensive instructions for dockerizing and running the Commerzbank application using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- Git (for cloning the repository)

## 🏗️ Architecture

The application consists of the following services:

- **Frontend**: React application served by Nginx
- **Backend**: Node.js API server with Express
- **Database**: PostgreSQL database
- **Redis**: Session storage and caching (optional)
- **Nginx**: Reverse proxy for production (optional)

## 📁 Docker Files Overview

```
├── Dockerfile.frontend          # Production React frontend
├── Dockerfile.backend           # Production Node.js backend
├── Dockerfile.backend.dev       # Development Node.js backend
├── docker-compose.yml           # Production setup
├── docker-compose.dev.yml       # Development setup
├── docker-compose.prod.yml      # Production with Nginx proxy
├── nginx.conf                   # Frontend Nginx config
├── nginx-prod.conf              # Production Nginx proxy config
├── .dockerignore                # Docker ignore rules
├── init-db.sql                  # Database initialization
└── env.production               # Production environment template
```

## 🚀 Quick Start

### Development Environment

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd COMMERZBANK.INFO
   ```

2. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend-dev npx prisma migrate deploy
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000 (if running React dev server)
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Production Environment

1. **Create environment file:**
   ```bash
   cp env.production .env.production
   # Edit .env.production with your production values
   ```

2. **Start production environment:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

4. **Access the application:**
   - Application: http://localhost:8080 (via Nginx proxy)
   - Direct backend: http://localhost:3001

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database
DATABASE_URL=postgresql://commcomm_user:password@postgres:5432/commcomm_db

# Security
ADMIN_PASSWORD=your_secure_password

# CORS
CORS_ORIGINS=http://localhost:80,https://yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB

# Ports
FRONTEND_PORT=80
NGINX_PORT=8080
```

### Database Configuration

The application uses PostgreSQL with Prisma ORM. The database is automatically initialized with:

- Database: `commcomm_db`
- User: `commcomm_user`
- Password: `secure_password_123` (change in production)

## 📦 Docker Commands

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Build with no cache
docker-compose build --no-cache
```

### Run Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Reset database
docker-compose exec backend npx prisma migrate reset
```

### Maintenance Commands

```bash
# View running containers
docker-compose ps

# Execute commands in container
docker-compose exec backend sh
docker-compose exec postgres psql -U commcomm_user -d commcomm_db

# View container logs
docker-compose logs backend
docker-compose logs postgres

# Restart service
docker-compose restart backend

# Scale services
docker-compose up -d --scale backend=3
```

## 🔒 Security Considerations

### Production Security

1. **Change default passwords:**
   ```bash
   ADMIN_PASSWORD=your_very_secure_password
   POSTGRES_PASSWORD=your_very_secure_db_password
   ```

2. **Use secrets management:**
   ```bash
   # Create secrets
   echo "your_password" | docker secret create admin_password -
   echo "your_db_password" | docker secret create postgres_password -
   ```

3. **Enable SSL/TLS:**
   - Configure SSL certificates in Nginx
   - Use Let's Encrypt for automatic certificates

4. **Network security:**
   - Use Docker networks for service isolation
   - Configure firewall rules
   - Use reverse proxy for additional security

### Security Headers

The Nginx configuration includes security headers:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`

## 📊 Monitoring and Health Checks

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3001/api/health
curl http://localhost:80/health
```

### Logging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f backend
```

### Resource Monitoring

```bash
# View resource usage
docker stats

# View container resource limits
docker-compose config
```

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed:**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec backend npx prisma db push
   ```

2. **Frontend not loading:**
   ```bash
   # Check if backend is running
   docker-compose ps backend
   
   # Check backend logs
   docker-compose logs backend
   
   # Test API endpoint
   curl http://localhost:3001/api/health
   ```

3. **File upload issues:**
   ```bash
   # Check uploads volume
   docker volume ls
   
   # Check uploads directory permissions
   docker-compose exec backend ls -la uploads/
   ```

4. **Port conflicts:**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3001
   
   # Change ports in docker-compose.yml
   ports:
     - "3002:3001"  # Use different host port
   ```

### Debug Mode

```bash
# Run in debug mode
docker-compose -f docker-compose.dev.yml up

# Access container shell
docker-compose exec backend sh
docker-compose exec postgres psql -U commcomm_user -d commcomm_db
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U commcomm_user commcomm_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U commcomm_user commcomm_db < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v commerzbank_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
docker run --rm -v commerzbank_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup.tar.gz -C /data .
```

## 📈 Performance Optimization

### Resource Limits

Configure resource limits in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### Scaling

```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Use load balancer
# Configure Nginx upstream with multiple backend instances
```

## 🛠️ Development Workflow

### Hot Reload Development

1. **Backend development:**
   ```bash
   # Use development compose file
   docker-compose -f docker-compose.dev.yml up -d
   
   # Backend will auto-reload on file changes
   ```

2. **Frontend development:**
   ```bash
   # Run React dev server locally
   npm start
   
   # Or use Docker with volume mounting
   docker run -v $(pwd)/src:/app/src -p 3000:3000 frontend-dev
   ```

### Testing

```bash
# Run tests in container
docker-compose exec backend npm test

# Run integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes in development environment
2. Update documentation for new features
3. Ensure security best practices
4. Test production deployment

## 📞 Support

For issues with the Docker setup:

1. Check the troubleshooting section
2. Review Docker logs
3. Check GitHub issues
4. Contact the development team
