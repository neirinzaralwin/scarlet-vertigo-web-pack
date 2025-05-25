# Docker Build GitHub Actions

This repository includes a simple GitHub Actions workflow for building and pushing Docker images to GitHub Container Registry for the Scarlet Vertigo monorepo.

## Workflow Overview

### `docker-build.yml` - Build and Push Workflow

**Triggers:**

- Push to `main` branch only

**Features:**

- **Simple and Fast**: Builds all apps on every main branch commit
- **Efficient Caching**: Uses GitHub Actions cache for faster builds
- **Matrix Strategy**: Builds all apps simultaneously in parallel
- **GitHub Container Registry**: Pushes images to `ghcr.io`

**Built Images:**

- `ghcr.io/{owner}/{repo}-api:latest`
- `ghcr.io/{owner}/{repo}-dashboard:latest`
- `ghcr.io/{owner}/{repo}-frontend:latest`

## Setup Instructions

### Repository Settings

1. **Enable GitHub Packages**: Go to `Settings > General > Features` and ensure "Packages" is enabled
2. **Configure Package Permissions**: Go to `Settings > Actions > General` and set:
    - "Workflow permissions" to "Read and write permissions"
    - Check "Allow GitHub Actions to create and approve pull requests"

**Note**: No additional secrets are needed as the workflow uses the built-in `GITHUB_TOKEN` for authentication.

## Usage

### Automatic Builds

Images are automatically built when:

- Code is pushed to `main` branch

### Manual Builds

You can manually trigger builds from the Actions tab:

1. Go to `Actions > Build and Push Docker Images`
2. Click "Run workflow"
3. Select main branch and run

## Image Tags

Images are tagged with:

- **Latest**: `latest` (for main branch)
- **SHA tags**: `main-a1b2c3d` (commit SHA)

## Using Built Images

### With Docker Compose

Update your `docker-compose.yml` to use the built images:

```yaml
version: '3.8'

services:
    api:
        image: ghcr.io/{owner}/{repo}-api:latest
        # ... rest of configuration

    dashboard:
        image: ghcr.io/{owner}/{repo}-dashboard:latest
        # ... rest of configuration

    frontend:
        image: ghcr.io/{owner}/{repo}-frontend:latest
        # ... rest of configuration
```

### Direct Docker Run

```bash
# Pull the latest images
docker pull ghcr.io/{owner}/{repo}-api:latest
docker pull ghcr.io/{owner}/{repo}-dashboard:latest
docker pull ghcr.io/{owner}/{repo}-frontend:latest

# Run individual services
docker run -p 3031:3031 ghcr.io/{owner}/{repo}-api:latest
docker run -p 3001:3001 ghcr.io/{owner}/{repo}-dashboard:latest
docker run -p 3002:3002 ghcr.io/{owner}/{repo}-frontend:latest
```

## Monitoring and Troubleshooting

### Build Status

Monitor build status:

- Check the Actions tab in your repository
- View logs for failed builds

### Common Issues

1. **Build Failures**: Check the Actions logs for specific error messages
2. **Permission Issues**: Ensure proper repository permissions are set
3. **Cache Issues**: Clear cache by re-running the workflow

### Cache Management

GitHub Actions cache is automatically managed, but you can:

- View cache usage in repository settings
- Clear cache by updating workflow files
- Optimize builds by improving Dockerfile efficiency

## Security

- **Minimal Base Images**: Uses `node:20-alpine` for smaller attack surface
- **Multi-stage Builds**: Reduces final image size and attack vectors
- **Secrets Management**: Uses GitHub secrets for sensitive information

## Performance Optimization

- **Parallel Builds**: Multiple apps build simultaneously
- **Layer Caching**: Docker layer caching reduces build times
- **Simple Workflow**: Streamlined process for faster execution
