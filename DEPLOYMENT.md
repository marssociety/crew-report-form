# Deployment Guide

Simple deployment guide for the Mars Society Crew Report application using:
- **Backend**: Ubuntu VM (Node.js + PM2)
- **Frontend**: Static web hosting (any provider)
- **CI/CD**: GitHub Actions

---

## Architecture

```
┌─────────────────────┐           ┌─────────────────────┐
│  Static Host        │           │  Ubuntu VM          │
│  (Frontend)         │  ◄─────►  │  (Backend API)      │
│                     │   HTTPS   │                     │
│  - React build      │           │  - Node.js 24       │
│  - Any CDN/host     │           │  - PM2 manager      │
└─────────────────────┘           │  - SQLite database  │
                                  └─────────────────────┘
```

---

## Prerequisites

- Ubuntu 20.04+ or 22.04+ VM with public IP
- Domain name (optional but recommended)
- SSH access to VM
- GitHub repository
- Static hosting provider (Netlify, Vercel, Cloudflare Pages, or any web host)

---

## Part 1: Backend Setup (Ubuntu VM)

### Step 1: Initial Server Setup

SSH into your Ubuntu VM:

```bash
ssh user@your-vm-ip
```

Update system:

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js 24

```bash
# Install Node.js 24 LTS
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v24.x.x
npm --version

# If npm command not found, reload your shell or run:
hash -r
# Or logout and login again
```

### Step 3: Install PM2 Process Manager

```bash
sudo npm install -g pm2
```

### Step 4: Setup Application User and Directory

**Recommended for Production**: Create a dedicated user for the application:

```bash
# Create dedicated application user
sudo useradd -m -s /bin/bash crewreport

# Create application directory
sudo mkdir -p /home/crewreport/app
sudo chown crewreport:crewreport /home/crewreport/app

# Switch to the crewreport user
sudo su - crewreport

# Clone repository (as crewreport user)
cd ~/app
git clone https://github.com/YOUR-USERNAME/crew-report-form.git .

# Exit back to your admin user
exit
```

**Alternative (Development/Testing)**: Use /var/www directory with your current user:

```bash
# Only if NOT using dedicated user above
sudo mkdir -p /var/www/crew-report
sudo chown $USER:$USER /var/www/crew-report
cd /var/www/crew-report
git clone https://github.com/YOUR-USERNAME/crew-report-form.git .
```

### Step 5: Configure Backend

```bash
# Switch to crewreport user
sudo su - crewreport

# Navigate to backend directory
cd ~/app/backend

# Install ALL dependencies (including dev dependencies needed for build)
npm ci

# Create production environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF

# Build backend
npm run build

# Optional: Remove dev dependencies after build to save space
# npm prune --production

# Exit back to admin user
exit
```

**Note**: If using the alternative /var/www approach, replace `~/app` with `/var/www/crew-report` in all commands.

### Step 6: Start Backend with PM2

```bash
# Switch to crewreport user
sudo su - crewreport

# Navigate to backend directory
cd ~/app/backend

# Start backend with PM2
pm2 start dist/index.js --name crew-report-backend

# Save PM2 process list
pm2 save

# Exit back to admin user
exit

# Configure PM2 to start on boot (run as your admin user, NOT as crewreport)
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u crewreport --hp /home/crewreport

# Check status (as admin user)
sudo su - crewreport -c "pm2 status"

# View logs
sudo su - crewreport -c "pm2 logs crew-report-backend --lines 20"
```

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

### Step 8: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/crew-report << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Change this to your domain or IP

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location / {
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

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/crew-report /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 9: Install SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Step 10: Test Backend

```bash
# Test locally
curl http://localhost:3001/health

# Test via Nginx
curl http://your-domain.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Part 2: Frontend Setup (Manual Deployment)

Build the frontend locally and upload to any static web host (Apache, Nginx, or any CDN):

```bash
# Configure API URL
echo "REACT_APP_API_URL=https://your-domain.com" > frontend/.env.production

# Build
cd frontend
npm ci
npm run build

# Upload frontend/build/ directory to your web host
```

Create `.htaccess` (for Apache) or equivalent for your host:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Part 3: GitHub Actions CI/CD

### Backend Auto-Deploy Workflow

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Ubuntu VM

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Deploy to VM via SSH
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.VM_HOST }}
        username: ${{ secrets.VM_USERNAME }}
        key: ${{ secrets.VM_SSH_KEY }}
        script: |
          sudo su - crewreport << 'DEPLOY_EOF'
          cd ~/app
          git pull origin main
          cd backend
          npm ci
          npm run build
          npm prune --production
          pm2 restart crew-report-backend
          pm2 save
          DEPLOY_EOF

    - name: Health Check
      run: |
        sleep 5
        curl -f https://${{ secrets.VM_HOST }}/health || exit 1
```

### Frontend Auto-Deploy (Optional)

If you want to automate frontend deployment, create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Build and Deploy Frontend

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
  workflow_dispatch:

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '24'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json

    - name: Install and Build
      working-directory: frontend
      env:
        REACT_APP_API_URL: ${{ secrets.BACKEND_URL }}
      run: |
        npm ci
        npm run build

    - name: Deploy to hosting
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./frontend/build/
        server-dir: ./public_html/
```

### Required GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

**For Backend:**
- `VM_HOST`: Your VM IP or domain
- `VM_USERNAME`: SSH username (your admin user, NOT crewreport)
- `VM_SSH_KEY`: Private SSH key (see below)

**For Frontend (optional, only if using automated deployment):**
- `BACKEND_URL`: Your backend URL (https://your-domain.com)
- `FTP_SERVER`: Your hosting FTP server
- `FTP_USERNAME`: FTP username
- `FTP_PASSWORD`: FTP password

### Generate SSH Key for GitHub Actions

On your local machine:

```bash
# Generate deployment key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy

# Copy public key to VM
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-vm-ip

# Copy private key to GitHub Secrets
cat ~/.ssh/github_deploy
# Add this as VM_SSH_KEY secret in GitHub
```

### Configure Sudo Access for Deployment User

On your Ubuntu VM, allow your admin user to switch to crewreport without password (needed for CI/CD):

```bash
# Edit sudoers file
sudo visudo

# Add this line (replace 'tmsadmin' with your actual admin username):
tmsadmin ALL=(crewreport) NOPASSWD: ALL

# Or for broader access (less secure):
# tmsadmin ALL=(ALL) NOPASSWD: ALL
```

**Important**: Only give NOPASSWD access to your CI/CD user for switching to the crewreport user, not for all sudo commands.

---

## Configuration Summary

### Backend Configuration

**File**: `backend/.env`
```env
NODE_ENV=production
PORT=3001
```

**Update CORS** in `backend/src/index.ts`:
```typescript
const allowedOrigins = [
  'https://your-frontend-domain.netlify.app',
  'https://your-custom-domain.com',
  'http://localhost:3000'  // For development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Frontend Configuration

**File**: `frontend/.env.production`
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

---

## Maintenance Commands

### Backend (on VM)

```bash
# View logs
pm2 logs crew-report-backend

# Restart backend
pm2 restart crew-report-backend

# Check status
pm2 status

# Monitor resources
pm2 monit

# Backup database (as crewreport user)
sudo su - crewreport -c "cp ~/app/backend/data/crew_reports.db ~/backup_$(date +%Y%m%d).db"

# Or copy to your admin user's home directory
sudo cp /home/crewreport/app/backend/data/crew_reports.db ~/backup_$(date +%Y%m%d).db
```

### Update Application

```bash
# SSH to VM
ssh user@your-vm-ip

# Switch to crewreport user
sudo su - crewreport

# Pull latest code
cd ~/app
git pull origin main

# Update and restart backend
cd backend
npm ci
npm run build
npm prune --production
pm2 restart crew-report-backend

# Exit back to admin user
exit
```

---

## Monitoring & Logs

### Check Application Health

```bash
# Backend health check
curl https://your-domain.com/health

# View backend logs (as crewreport user)
sudo su - crewreport -c "pm2 logs crew-report-backend --lines 100"

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Setup Log Rotation

PM2 handles log rotation automatically. For Nginx:

```bash
# Nginx log rotation is configured by default in Ubuntu
ls /etc/logrotate.d/nginx
```

---

## Troubleshooting

### Node.js / npm Installation Issues

**Problem**: `npm: command not found` after installing Node.js

**Solutions**:

```bash
# Option 1: Check if Node.js was actually installed
node --version

# If node command works but npm doesn't, npm might not be in PATH
# Reload shell hash table
hash -r

# Or find where npm is installed
which npm
ls -la /usr/bin/npm

# Option 2: If Node.js is already installed (you mentioned you have Node 24)
# Just verify the version and proceed
node --version  # Should show v24.x.x

# Check if npm is available
npm --version

# If npm still not found, reinstall nodejs
sudo apt-get remove nodejs npm -y
sudo apt-get autoremove -y
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify both are now available
node --version && npm --version

# Option 3: If you installed Node.js via a different method (nvm, snap, etc.)
# Make sure it's in your PATH. You may need to logout/login or source your profile:
source ~/.bashrc
# or
source ~/.profile
```

### Backend Not Starting

```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs crew-report-backend --lines 50

# Check if port is in use
sudo lsof -i :3001

# Restart
pm2 restart crew-report-backend
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Frontend Can't Reach Backend

1. Check CORS configuration in backend
2. Verify `REACT_APP_API_URL` in frontend build
3. Test backend directly: `curl https://your-backend.com/health`
4. Check browser console for errors

### Database Issues

```bash
# Check database file exists
sudo ls -lh /home/crewreport/app/backend/data/crew_reports.db

# Check permissions (should be owned by crewreport)
sudo ls -la /home/crewreport/app/backend/data/

# Fix permissions if needed
sudo chown crewreport:crewreport /home/crewreport/app/backend/data/crew_reports.db
sudo chmod 644 /home/crewreport/app/backend/data/crew_reports.db

# Backup and restore (as crewreport user)
sudo su - crewreport
cp ~/app/backend/data/crew_reports.db ~/app/backend/data/crew_reports.db.backup
exit
```

---

## Security Best Practices

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH keys** (disable password auth)
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

3. **Configure firewall** (already done in setup)

4. **Regular backups**
   ```bash
   # Add to crewreport user's crontab
   sudo su - crewreport
   mkdir -p ~/backups
   crontab -e
   # Add: 0 2 * * * cp ~/app/backend/data/crew_reports.db ~/backups/db_$(date +\%Y\%m\%d).db
   exit
   ```

5. **Monitor logs** regularly

6. **Use SSL/HTTPS** (already configured with Certbot)

---

## Cost Estimate

### Minimal Setup (Development/Testing)
- VM: $5-10/month (1GB RAM, 1 CPU)
- Frontend: $0 (Netlify/Vercel free tier)
- **Total: $5-10/month**

### Production Setup
- VM: $10-20/month (2GB RAM, 2 CPU)
- Frontend: $0 (Netlify/Vercel free tier or $20/month for pro)
- **Total: $10-40/month**

---

## Quick Start Checklist

### Backend Setup
- [ ] Provision Ubuntu VM
- [ ] Install Node.js 24
- [ ] Install PM2
- [ ] Clone repository
- [ ] Build and start backend
- [ ] Configure Nginx
- [ ] Setup SSL with Certbot
- [ ] Test backend API

### Frontend Setup
- [ ] Choose static hosting provider
- [ ] Configure environment variable (API URL)
- [ ] Connect GitHub repository
- [ ] Deploy frontend
- [ ] Test frontend

### CI/CD Setup
- [ ] Create GitHub Actions workflows
- [ ] Add required secrets
- [ ] Test automated deployment
- [ ] Verify both frontend and backend update correctly

---

## Support

For issues or questions:
1. Check the [backend/src/index.ts](backend/src/index.ts) for API configuration
2. Check the [frontend/src/](frontend/src/) components for frontend code
3. Review PM2 logs: `pm2 logs`
4. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

**Last Updated**: January 2026
**Architecture**: Ubuntu VM (Backend) + Static Hosting (Frontend)
**Status**: Production Ready
