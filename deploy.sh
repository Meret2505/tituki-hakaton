#!/bin/bash
set -e

echo "=== BilimPortal Deployment Script ==="
echo "Ubuntu 20.04 | Next.js | SQLite | PM2 | Nginx"
echo ""

APP_DIR="/var/www/bilimportal"
LOG_DIR="/var/log/bilimportal"
DOMAIN=${DOMAIN:-"your-server-ip"}

# 1. Update system
echo "[1/9] Updating system packages..."
apt-get update -qq
apt-get install -y curl git nginx ufw

# 2. Install Node.js 20
echo "[2/9] Installing Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

# 3. Install PM2
echo "[3/9] Installing PM2..."
npm install -g pm2

# 4. Set up app directory
echo "[4/9] Setting up app directory..."
mkdir -p "$APP_DIR" "$LOG_DIR"

# Copy files (assumes script is run from project root)
rsync -av --exclude=node_modules --exclude=.git --exclude=.env . "$APP_DIR/"

# 5. Install dependencies
echo "[5/9] Installing dependencies..."
cd "$APP_DIR"
npm install --production=false

# 6. Set up .env
echo "[6/9] Configuring environment..."
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
NEXTAUTH_URL="http://$DOMAIN"
NODE_ENV="production"
EOF
  echo "Created .env — IMPORTANT: Update NEXTAUTH_URL with your domain!"
fi

# 7. Database setup
echo "[7/9] Setting up database..."
npx prisma migrate deploy
npx tsx prisma/seed.ts

# 8. Build Next.js
echo "[8/9] Building application..."
npm run build

# 9. Nginx configuration
echo "[9/9] Configuring Nginx..."
cat > /etc/nginx/sites-available/bilimportal << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 50M;
}
EOF

ln -sf /etc/nginx/sites-available/bilimportal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Start with PM2
pm2 delete bilimportal 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "✅ Deployment complete!"
echo ""
echo "App URL:     http://$DOMAIN"
echo "Admin login: admin@bilimportal.tm / admin123"
echo "User login:  okuwcy@bilimportal.tm / user1234"
echo ""
echo "Next steps:"
echo "  1. Update NEXTAUTH_URL in $APP_DIR/.env"
echo "  2. Set up SSL: certbot --nginx -d yourdomain.com"
echo "  3. Change default passwords in the admin panel"
