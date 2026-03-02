# Deployment Guide — Phobos Server

Deploy the Mars Society Crew Report application to `crew-reports.marssociety.org` on the **phobos** server for testing and evaluation.

## Architecture

```
                    crew-reports.marssociety.org
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Nginx (port 80/443)│
                    │                     │
                    │  /api/*  ──► proxy  │──► Node.js :3001
                    │  /health ──► proxy  │──► Node.js :3001
                    │  /*      ──► static │──► /var/www/crew-report/frontend/build/
                    └─────────────────────┘
                              │
                    ┌─────────────────────┐
                    │  Backend (PM2)      │
                    │  - Express API      │
                    │  - SQLite database  │
                    └─────────────────────┘
```

Single-server setup: Nginx serves the React frontend as static files and reverse-proxies API requests to the Node.js backend.

---

## Prerequisites

- SSH access to phobos
- DNS A record: `crew-reports.marssociety.org` → phobos IP
- Node.js 24 installed on phobos
- PM2 process manager (`sudo npm install -g pm2`)

---

## Step 1: Clone the Repository

```bash
ssh user@phobos

sudo mkdir -p /var/www/crew-report
sudo chown $USER:$USER /var/www/crew-report
cd /var/www/crew-report
git clone https://github.com/YOUR-USERNAME/crew-report-form.git .
```

---

## Step 2: Build and Start the Backend

```bash
cd /var/www/crew-report/backend

# Install dependencies
npm ci

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
EOF

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name crew-report-backend
pm2 save

# Verify it's running
curl http://localhost:3001/health
# Expected: {"status":"healthy","timestamp":"..."}
```

Set PM2 to start on boot:

```bash
pm2 startup
# Run the command it outputs (will look like: sudo env PATH=... pm2 startup ...)
pm2 save
```

---

## Step 3: Build the Frontend

```bash
cd /var/www/crew-report/frontend

# Set the production API URL (same domain, Nginx will proxy)
cat > .env.production << EOF
REACT_APP_API_URL=https://crew-reports.marssociety.org
EOF

# Install dependencies and build
npm ci
npm run build
```

The built files will be in `frontend/build/`.

---

## Step 4: Configure Nginx

```bash
sudo apt install -y nginx
```

Create the site config:

```bash
sudo tee /etc/nginx/sites-available/crew-report << 'EOF'
server {
    listen 80;
    server_name crew-reports.marssociety.org;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # Proxy health check
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        access_log off;
    }

    # Serve React frontend (static files)
    location / {
        root /var/www/crew-report/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/crew-report/frontend/build;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/crew-report /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 5: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## Step 6: Install SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (will auto-update the Nginx config)
sudo certbot --nginx -d crew-reports.marssociety.org

# Verify auto-renewal
sudo certbot renew --dry-run
```

---

## Step 7: Verify Deployment

```bash
# Backend health check
curl https://crew-reports.marssociety.org/health

# API endpoint
curl https://crew-reports.marssociety.org/api/reports

# Frontend (should return HTML)
curl -s https://crew-reports.marssociety.org | head -5
```

Open `https://crew-reports.marssociety.org` in a browser — you should see the login screen.

---

## Updating the Application

```bash
ssh user@phobos
cd /var/www/crew-report

# Pull latest code
git pull origin master

# Rebuild backend
cd backend
npm ci
npm run build
pm2 restart crew-report-backend

# Rebuild frontend
cd ../frontend
npm ci
npm run build
```

No Nginx restart is needed — it serves the build directory directly.

---

## Maintenance Commands

```bash
# View backend logs
pm2 logs crew-report-backend

# Restart backend
pm2 restart crew-report-backend

# Check PM2 status
pm2 status

# Monitor resources
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Backup database
cp /var/www/crew-report/backend/data/crew_reports.db ~/crew_reports_backup_$(date +%Y%m%d).db
```

---

## Troubleshooting

### Backend won't start

```bash
pm2 logs crew-report-backend --lines 50
sudo lsof -i :3001        # Check if port is in use
pm2 restart crew-report-backend
```

### Frontend shows blank page or 404

```bash
# Verify the build exists
ls /var/www/crew-report/frontend/build/index.html

# Check Nginx config
sudo nginx -t
sudo systemctl status nginx
```

### API calls fail (CORS or connection errors)

1. Verify backend is running: `curl http://localhost:3001/health`
2. Check that `REACT_APP_API_URL` was set before building the frontend
3. Verify Nginx is proxying correctly: `curl https://crew-reports.marssociety.org/api/reports`
4. Check Nginx error log: `sudo tail -f /var/log/nginx/error.log`

### Database issues

```bash
# Check database file
ls -lh /var/www/crew-report/backend/data/crew_reports.db

# Fix permissions if needed
sudo chown $USER:$USER /var/www/crew-report/backend/data/crew_reports.db

# Backup before making changes
cp /var/www/crew-report/backend/data/crew_reports.db ~/crew_reports.db.backup
```

---

## Optional: GitHub Actions CI/CD

Create `.github/workflows/deploy.yml` to auto-deploy on push:

```yaml
name: Deploy to Phobos

on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy via SSH
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PHOBOS_HOST }}
        username: ${{ secrets.PHOBOS_USERNAME }}
        key: ${{ secrets.PHOBOS_SSH_KEY }}
        script: |
          cd /var/www/crew-report
          git pull origin master
          cd backend && npm ci && npm run build && pm2 restart crew-report-backend
          cd ../frontend && npm ci && npm run build

    - name: Health check
      run: |
        sleep 5
        curl -f https://crew-reports.marssociety.org/health || exit 1
```

**Required GitHub Secrets** (Repository → Settings → Secrets → Actions):
- `PHOBOS_HOST` — phobos IP address or hostname
- `PHOBOS_USERNAME` — SSH username
- `PHOBOS_SSH_KEY` — private SSH key for deployment

---

## Quick Start Checklist

- [ ] DNS A record for `crew-reports.marssociety.org` points to phobos
- [ ] Clone repo to `/var/www/crew-report`
- [ ] Build and start backend with PM2
- [ ] Build frontend with production API URL
- [ ] Configure and enable Nginx
- [ ] Open firewall ports (22, 80, 443)
- [ ] Install SSL certificate with Certbot
- [ ] Verify `https://crew-reports.marssociety.org` loads
- [ ] Verify API works: `/health` and `/api/reports`

---

**Last Updated**: March 2026
**Server**: phobos
**Domain**: crew-reports.marssociety.org
**Status**: Testing & Evaluation
