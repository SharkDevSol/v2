#!/bin/bash
# Deployment script for Skoolific V2
# VPS: root@76.13.48.245
# Domain: https://v2.skoolific.com
# Backend Port: 8081

set -e

echo "========================================="
echo "  Skoolific V2 - VPS Deployment Script"
echo "========================================="

# Variables
APP_DIR="/var/www/skoolificV2"
REPO_URL="https://github.com/SharkDevSol/v2.git"
DOMAIN="v2.skoolific.com"
BACKEND_PORT=8081

# Step 1: Update system and install dependencies
echo "[1/8] Installing system dependencies..."
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

echo "Node: $(node -v) | NPM: $(npm -v)"

# Step 2: Clone or pull the repository
echo "[2/8] Setting up application code..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Step 3: Setup Backend
echo "[3/8] Setting up backend..."
cd "$APP_DIR/backend"
npm install --production

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64').replace(/[^a-zA-Z0-9]/g, ''))")
    sed -i "s/your_jwt_secret_here_change_in_production/$JWT_SECRET/" .env
    sed -i "s/PORT=5052/PORT=$BACKEND_PORT/" .env
    sed -i "s|FRONTEND_URL=http://localhost:5173|FRONTEND_URL=https://$DOMAIN|" .env
    sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
    echo ""
    echo "⚠️  IMPORTANT: Edit /var/www/skoolificV2/backend/.env"
    echo "   Update DATABASE_URL, DB_PASSWORD, and other secrets!"
    echo ""
fi

# Step 4: Setup Frontend
echo "[4/8] Building frontend..."
cd "$APP_DIR/frontend"
npm install

# Create production .env for frontend
cat > .env.production << EOF
VITE_API_URL=https://$DOMAIN
VITE_APP_NAME=Skoolific V2
VITE_APP_VERSION=2.0.0
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_AI_TESTS=true
VITE_ENABLE_ETHIOPIAN_CALENDAR=true
EOF

# Build frontend
npm run build

# Step 5: Setup Nginx
echo "[5/8] Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend - serve static files
    root $APP_DIR/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;

    # API proxy to backend
    location /api {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Socket.io support
    location /socket.io {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Uploads directory
    location /uploads {
        alias $APP_DIR/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - all routes go to index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t && systemctl reload nginx

# Step 6: Setup SSL with Let's Encrypt
echo "[6/8] Setting up SSL certificate..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
    echo "⚠️  SSL setup failed. You may need to run manually:"
    echo "   certbot --nginx -d $DOMAIN"
}

# Step 7: Setup PM2 for backend
echo "[7/8] Starting backend with PM2..."
cd "$APP_DIR/backend"
pm2 delete skoolific-v2-backend 2>/dev/null || true
pm2 start server.js --name "skoolific-v2-backend" --env production
pm2 save
pm2 startup systemd -u root --hp /root

# Step 8: Setup PostgreSQL database
echo "[8/8] Database setup..."
sudo -u postgres psql -c "CREATE DATABASE skoolific;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '12341234';" 2>/dev/null || true

# Run Prisma migrations
cd "$APP_DIR/backend"
npx prisma migrate deploy 2>/dev/null || npx prisma db push || echo "⚠️  Run prisma migrations manually"

echo ""
echo "========================================="
echo "  ✅ Deployment Complete!"
echo "========================================="
echo ""
echo "  🌐 URL: https://$DOMAIN"
echo "  🔧 Backend: port $BACKEND_PORT (PM2)"
echo "  📁 App Dir: $APP_DIR"
echo ""
echo "  Useful commands:"
echo "    pm2 status              - Check backend status"
echo "    pm2 logs                - View backend logs"
echo "    pm2 restart all         - Restart backend"
echo "    nginx -t && systemctl reload nginx  - Reload nginx"
echo ""
echo "  ⚠️  Don't forget to:"
echo "    1. Update backend/.env with correct DB credentials"
echo "    2. Point DNS for $DOMAIN to this server (76.13.48.245)"
echo "    3. Open ports 80, 443, and $BACKEND_PORT in firewall"
echo ""
