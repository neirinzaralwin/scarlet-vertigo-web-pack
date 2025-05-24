# Deployment Guide

## Repository Secrets Setup

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add these secrets:

### Required Secrets:

- **`HOST`**: `193.180.211.65`
- **`USERNAME`**: `admin`
- **`SSH_PRIVATE_KEY`**: Content of your private SSH key file (`/neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh`)
- **`SSH_PORT`**: `22` (optional, defaults to 22)

### How to get SSH_PRIVATE_KEY:

```bash
cat /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

## Server Setup

1. **Copy the setup script to your server:**

    ```bash
    scp -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh \
        scripts/server-setup.sh admin@193.180.211.65:~/
    ```

2. **SSH to your server:**

    ```bash
    ssh -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh admin@193.180.211.65
    ```

3. **Run the setup script:**

    ```bash
    chmod +x ~/server-setup.sh
    sudo ~/server-setup.sh
    ```

4. **Copy your SSH private key to the server:**
    ```bash
    # On your local machine
    scp -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh \
        /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh \
        admin@193.180.211.65:~/.ssh/scarlet_vertigo_ssh
    ```

## Deployment Process

The deployment happens automatically when you push to the `main` branch:

1. **Build workflow** runs first and builds Docker images
2. **Deploy workflow** runs after build completes successfully
3. Images are deployed to your server at `193.180.211.65`

### Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in your GitHub repository
2. Click on **Deploy to Production** workflow
3. Click **Run workflow** button

## Services Access

After successful deployment, your services will be available at:

- **API**: `http://193.180.211.65:3031`
- **Dashboard**: `http://193.180.211.65:3001`
- **Frontend**: `http://193.180.211.65:3000`

## Monitoring & Debugging

### Check deployment status:

```bash
ssh -i /neirinzaralwin/Developer/randev/credentials/scarlet-vertigo/scarlet_vertigo_ssh admin@193.180.211.65

# Check running containers
docker ps

# Check container logs
cd /home/admin/scarlet-vertigo-app
docker-compose -f docker-compose.prod.yml logs api
docker-compose -f docker-compose.prod.yml logs dashboard
docker-compose -f docker-compose.prod.yml logs scarlet-frontend

# Check MongoDB tunnel
sudo systemctl status mongodb-tunnel.service
```

### Common Issues:

1. **MongoDB connection issues**: Check tunnel service status
2. **Container not starting**: Check logs for specific error messages
3. **Port conflicts**: Ensure ports 3000, 3001, 3031 are available

## Environment Variables

The docker-compose.prod.yml includes these environment variables:

- `NODE_ENV=production`
- `MONGODB_URI=mongodb://host.docker.internal:27017/scarlet-vertigo`
- `NEXT_PUBLIC_API_URL=http://localhost:3031`

You can add more environment variables to the docker-compose.prod.yml file as needed.

## Rollback

If you need to rollback to a previous version:

1. **Find the previous image tag** in GitHub Container Registry
2. **SSH to server** and update docker-compose.prod.yml with the specific tag
3. **Restart containers**:
    ```bash
    cd /home/admin/scarlet-vertigo-app
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    ```
