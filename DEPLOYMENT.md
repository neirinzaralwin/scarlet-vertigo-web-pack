# Scarlet Vertigo Deployment Guide

This guide provides step-by-step instructions for deploying the Scarlet Vertigo application from GitHub Container Registry to your production server.

## Prerequisites

- Docker and Docker Compose installed on the server
- MongoDB running on the server (localhost:27017)
- SSH access to the server
- GitHub Container Registry access

## Server Information

- **Host**: 193.180.211.65
- **User**: admin
- **SSH Key**: Located at `/neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh`
- **MongoDB**: Running on localhost:27017 with tunnel

## Deployment Methods

### 1. Automatic Deployment (Recommended)

The application automatically deploys when you push to the `main` branch:

1. Push your changes to main branch:

    ```bash
    git add .
    git commit -m "Your changes"
    git push origin main
    ```

2. GitHub Actions will:

    - Build Docker images
    - Push to GitHub Container Registry
    - Automatically deploy to server

3. Monitor deployment in GitHub Actions tab

### 2. Manual Deployment

#### Option A: Using GitHub Actions (Manual Trigger)

1. Go to GitHub Actions tab
2. Select "Deploy to Server" workflow
3. Click "Run workflow"
4. Select main branch and run

#### Option B: Command Line Deployment

```bash
# 1. Connect to your server
ssh -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh admin@193.180.211.65

# 2. Create project directory (first time only)
mkdir -p /home/admin/scarlet-vertigo
cd /home/admin/scarlet-vertigo

# 3. Create production docker-compose file
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  api:
    image: ghcr.io/your-username/your-repo-api:latest
    container_name: scarlet-vertigo-api
    network_mode: host
    environment:
      - PORT=3031
      - DATABASE_URL=mongodb://127.0.0.1:27017/scarlet-vertigo-db?replicaSet=rs0
      - JWT_SECRET=your-production-jwt-secret-key-change-this-2024
      - ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC=86400
      - NODE_ENV=production
    restart: always

  dashboard:
    image: ghcr.io/your-username/your-repo-dashboard:latest
    container_name: scarlet-vertigo-dashboard
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NEXT_PUBLIC_API_URL=http://localhost:3031
    depends_on:
      - api
    restart: always

  frontend:
    image: ghcr.io/your-username/your-repo-frontend:latest
    container_name: scarlet-vertigo-frontend
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - NEXT_PUBLIC_API_URL=http://localhost:3031
    depends_on:
      - api
    restart: always
EOF

# 4. Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# 5. Pull latest images
docker-compose -f docker-compose.prod.yml pull

# 6. Deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 7. Check status
docker ps
```

## Server Setup (One-time)

### 1. Initial Server Configuration

```bash
# Connect to server
ssh -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh admin@193.180.211.65

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker admin

# Exit and reconnect for group changes to take effect
exit
```

### 2. MongoDB Setup (if not already running)

```bash
# Connect to server
ssh -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh admin@193.180.211.65

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Configure MongoDB for replica set (required for your app)
mongo --eval 'rs.initiate()'
```

### 3. Create Project Directory

```bash
# Create application directory
mkdir -p /home/admin/scarlet-vertigo
cd /home/admin/scarlet-vertigo
```

## Environment Variables

The application requires the following environment variables to be set:

### API Environment Variables

- `PORT`: API server port (default: 3031)
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing (change in production!)
- `ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC`: JWT token expiration time in seconds (default: 86400 = 24 hours)
- `NODE_ENV`: Environment name (production, development, etc.)

### Frontend Environment Variables

- `NEXT_PUBLIC_API_URL`: URL to the API server

## GitHub Secrets Configuration

Ensure these secrets are configured in your GitHub repository:

1. Go to GitHub → Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret Name      | Value                   | Description                     |
| ---------------- | ----------------------- | ------------------------------- |
| `SERVER_HOST`    | `193.180.211.65`        | Server IP address               |
| `SERVER_USER`    | `admin`                 | SSH username                    |
| `SERVER_SSH_KEY` | `[Private Key Content]` | Content of your SSH private key |

## Monitoring and Troubleshooting

### Check Application Status

```bash
# Connect to server
ssh -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh admin@193.180.211.65

# Check running containers
docker ps

# Check container logs
docker logs scarlet-vertigo-api
docker logs scarlet-vertigo-dashboard
docker logs scarlet-vertigo-frontend

# Check application health
curl http://localhost:3031/health  # API
curl http://localhost:3001         # Dashboard
curl http://localhost:3002         # Frontend
```

### Common Issues and Solutions

#### 1. Container Won't Start

```bash
# Check logs for specific container
docker logs [container-name]

# Restart specific service
docker-compose -f docker-compose.prod.yml restart [service-name]
```

#### 2. Database Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

#### 3. Image Pull Issues

```bash
# Re-login to registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Manual pull
docker pull ghcr.io/your-username/your-repo-api:latest
```

### Useful Commands

```bash
# View all containers (running and stopped)
docker ps -a

# View container resource usage
docker stats

# Clean up unused images and containers
docker system prune -f

# View container logs in real-time
docker logs -f [container-name]

# Execute command inside container
docker exec -it [container-name] /bin/sh

# Restart all services
cd /home/admin/scarlet-vertigo
docker-compose -f docker-compose.prod.yml restart

# Update to latest images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Security Notes

- SSH key should have restricted permissions (600)
- GitHub tokens should have minimal required permissions
- **IMPORTANT**: Change the JWT_SECRET in production to a strong, unique secret key
- Consider using environment-specific configurations
- Regularly update server packages and Docker images
- Store sensitive environment variables securely

## Support

If you encounter issues:

1. Check GitHub Actions logs for deployment failures
2. Check server logs using the commands above
3. Verify all secrets are correctly configured
4. Ensure MongoDB is running and accessible

## URLs After Deployment

- **API**: http://193.180.211.65:3031
- **Dashboard**: http://193.180.211.65:3001
- **Frontend**: http://193.180.211.65:3002
