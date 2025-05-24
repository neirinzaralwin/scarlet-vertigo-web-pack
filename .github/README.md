# CI/CD Setup

This repository includes GitHub Actions workflows for automated testing, building, and deployment.

## Workflows

### 1. CI Tests (`.github/workflows/ci.yml`)

- Runs on every push and PR to main/develop branches
- Installs dependencies, runs linting, type checking, tests, and builds
- Must pass before merging PRs

### 2. Build and Deploy (`.github/workflows/build-and-deploy.yml`)

- Runs on push to main branch
- Uses path filtering to only build changed apps
- Builds Docker images for each app and pushes to GitHub Container Registry
- Images are tagged with branch name, commit SHA, and 'latest' for main branch

### 3. Deploy to Production (`.github/workflows/deploy.yml`)

- Runs after successful build on main branch
- Template for production deployment (customize as needed)

## Docker Images

Built images are pushed to GitHub Container Registry:

- `ghcr.io/{your-org}/{repo-name}-api:latest`
- `ghcr.io/{your-org}/{repo-name}-dashboard:latest`
- `ghcr.io/{your-org}/{repo-name}-scarlet-frontend:latest`

## Production Deployment

Use `docker-compose.prod.yml` for production deployment:

```bash
export GITHUB_REPOSITORY=your-org/your-repo-name
docker-compose -f docker-compose.prod.yml up -d
```

## Setup Steps

1. **Enable GitHub Container Registry**: The workflows automatically use GHCR with the built-in `GITHUB_TOKEN`

2. **Configure Secrets** (for deployment):

    - Go to repository Settings → Secrets and variables → Actions
    - Add secrets like `HOST`, `USERNAME`, `KEY` for SSH deployment

3. **Customize deployment**: Update the deploy workflow with your specific deployment logic

## Package.json Scripts

Make sure your root `package.json` includes these scripts:

```json
{
    "scripts": {
        "lint": "turbo run lint",
        "type-check": "turbo run type-check",
        "test": "turbo run test",
        "build": "turbo run build"
    }
}
```

## Path Filtering

The build workflow uses path filtering to only build changed apps:

- Changes to `apps/api/**` trigger API build
- Changes to `apps/dashboard/**` trigger dashboard build
- Changes to `apps/scarlet-frontend/**` trigger frontend build
- Changes to `packages/**` trigger all builds
