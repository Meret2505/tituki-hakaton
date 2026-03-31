#!/bin/bash
set -e

SERVER="192.168.100.183"
SSHUSER="root"
PASS="Admin123"
APP_DIR="/var/www/bilimportal"
DOMAIN="192.168.100.183"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; GRAY='\033[0;90m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"; }
ok()  { echo -e "${GREEN}[$(date +%H:%M:%S)] ✓${NC} $1"; }
err() { echo -e "${RED}[$(date +%H:%M:%S)] ✗${NC} $1"; }
sub() { echo -e "${GRAY}              $1${NC}"; }
remote() { sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no -o LogLevel=ERROR "$SSHUSER@$SERVER" bash; }

if ! command -v sshpass &>/dev/null; then
  err "sshpass not found: brew install sshpass"; exit 1
fi

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  BilimPortal — Remote Deployment  $(date)${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# ── STEP 1: Connectivity ───────────────────────────────────
log "[1/8] Checking server connectivity..."
remote << 'EOF'
echo "  hostname: $(hostname)"
echo "  uptime:   $(uptime)"
echo "  disk:     $(df -h / | awk 'NR==2{print $4}') free"
echo "  ram:      $(free -m | awk 'NR==2{print $7}') MB free"
EOF
ok "Connected."

# ── STEP 2: Check/install tools ────────────────────────────
log "[2/8] Checking Node.js, Nginx, PM2..."
remote << 'EOF'
export PATH="$(npm prefix -g 2>/dev/null)/bin:$PATH"

# Node.js
if command -v node &>/dev/null; then
  VER=$(node -v | cut -d. -f1 | tr -d 'v')
  if [ "$VER" -ge 18 ]; then
    echo "  ✓ Node $(node -v) already installed"
  else
    echo "  Node $(node -v) too old, upgrading..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs -qq > /dev/null 2>&1
    echo "  ✓ Node $(node -v) installed"
  fi
else
  echo "  Node not found, installing v20..."
  apt-get update -qq > /dev/null 2>&1
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y nodejs -qq > /dev/null 2>&1
  echo "  ✓ Node $(node -v) installed"
fi

# Nginx
if command -v nginx &>/dev/null; then
  echo "  ✓ Nginx $(nginx -v 2>&1 | grep -o '[0-9.]*') already installed"
else
  echo "  Installing Nginx..."
  apt-get install -y nginx -qq > /dev/null 2>&1
  echo "  ✓ Nginx installed"
fi

# PM2
export PATH="$(npm prefix -g)/bin:$PATH"
if command -v pm2 &>/dev/null; then
  echo "  ✓ PM2 v$(pm2 -v) already installed"
else
  echo "  Installing PM2..."
  npm install -g pm2 --silent > /dev/null 2>&1
  export PATH="$(npm prefix -g)/bin:$PATH"
  echo "  ✓ PM2 v$(pm2 -v) installed"
fi

# UFW
command -v ufw &>/dev/null || apt-get install -y ufw -qq > /dev/null 2>&1
echo "  ✓ UFW present"
EOF
ok "Tools ready."

# ── STEP 3: Copy source files ──────────────────────────────
log "[3/8] Copying project source files..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no -o LogLevel=ERROR "$SSHUSER@$SERVER" "mkdir -p $APP_DIR"
rsync -az --delete \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude="*.db" \
  --exclude=".env" \
  --info=progress2 \
  -e "sshpass -p $PASS ssh -o StrictHostKeyChecking=no -o LogLevel=ERROR" \
  /Users/meret/hakaton/ \
  "$SSHUSER@$SERVER:$APP_DIR/" 2>&1 | while read line; do sub "$line"; done
ok "Source files copied."

# ── STEP 4: .env setup ─────────────────────────────────────
log "[4/8] Configuring .env..."
remote << EOF
if [ -f "$APP_DIR/.env" ]; then
  echo "  .env exists, keeping it"
  grep -E "DATABASE_URL|NEXTAUTH_URL" "$APP_DIR/.env" | while read l; do echo "  \$l"; done
else
  SECRET=\$(openssl rand -hex 32)
  cat > "$APP_DIR/.env" << ENVEOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="\$SECRET"
NEXTAUTH_URL="http://$DOMAIN"
NODE_ENV="production"
PORT=3000
ENVEOF
  echo "  .env created"
  echo "  NEXTAUTH_URL=http://$DOMAIN"
fi
EOF
ok ".env ready."

# ── STEP 5: Copy node_modules ──────────────────────────────
log "[5/8] Streaming node_modules via tar..."
sub "Size: $(du -sh /Users/meret/hakaton/node_modules 2>/dev/null | cut -f1)"
START=$SECONDS
tar -czf - -C /Users/meret/hakaton node_modules 2>/dev/null | \
  sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no -o LogLevel=ERROR "$SSHUSER@$SERVER" \
  "tar -xzf - -C $APP_DIR"
ok "node_modules copied in $((SECONDS-START))s."

log "  Rebuilding native binaries for Linux..."
remote << EOF
cd "$APP_DIR"
echo "  Removing Mac-specific .node binaries (darwin only)..."
find node_modules -name "*darwin*.node" -delete 2>/dev/null || true
echo "  Rebuilding better-sqlite3 for Linux..."
npm rebuild better-sqlite3 2>&1
echo "  Verifying lightningcss..."
node -e "require('lightningcss')" 2>&1 && echo "  ✓ lightningcss OK" || echo "  ✗ lightningcss failed"
echo "  Verifying better-sqlite3..."
node -e "require('better-sqlite3')" 2>&1 && echo "  ✓ better-sqlite3 OK" || echo "  ✗ better-sqlite3 failed"
EOF
ok "Native rebuild done."

# ── STEP 6: Database ───────────────────────────────────────
log "[6/8] Setting up database..."
remote << EOF
cd "$APP_DIR"
echo "  Running migrations..."
npx prisma migrate deploy 2>&1 | tail -5

echo "  Checking seed..."
COUNT=\$(node -e "
const {PrismaClient}=require('@prisma/client');
const {PrismaBetterSqlite3}=require('@prisma/adapter-better-sqlite3');
const path=require('path');
const a=new PrismaBetterSqlite3({url:'file:'+path.join(process.cwd(),'dev.db')});
const p=new PrismaClient({adapter:a});
p.user.count().then(n=>{console.log(n);p.\\\$disconnect();}).catch(()=>console.log(0));
" 2>/dev/null || echo 0)
echo "  Users in DB: \$COUNT"
if [ "\$COUNT" = "0" ]; then
  echo "  Seeding..."
  npx tsx prisma/seed.ts 2>&1
else
  echo "  DB has data, skipping seed"
fi
EOF
ok "Database ready."

# ── STEP 7: Build ──────────────────────────────────────────
log "[7/8] Building Next.js (webpack mode)..."
START=$SECONDS
remote << EOF
cd "$APP_DIR"
npx next build --webpack 2>&1
EOF
ok "Build done in $((SECONDS-START))s."

# ── STEP 8: PM2 + Nginx + UFW ─────────────────────────────
log "[8/8] Starting services..."
remote << EOF
export PATH="\$(npm prefix -g)/bin:\$PATH"
cd "$APP_DIR"

# PM2
echo "  PM2 binary: \$(which pm2)"
if pm2 list 2>/dev/null | grep -q bilimportal; then
  pm2 restart bilimportal --update-env
  echo "  PM2: restarted"
else
  pm2 start ecosystem.config.js
  echo "  PM2: started"
fi
pm2 save --force > /dev/null 2>&1
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash > /dev/null 2>&1 || true
echo "  PM2: startup configured"

# Nginx
mkdir -p /var/log/bilimportal
cat > /etc/nginx/sites-available/bilimportal << 'NGINXEOF'
server {
    listen 80;
    server_name _;
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
NGINXEOF
ln -sf /etc/nginx/sites-available/bilimportal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx && systemctl enable nginx --quiet
echo "  Nginx: configured and reloaded"

# UFW
ufw allow 22/tcp > /dev/null 2>&1 || true
ufw allow 80/tcp > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true
ufw --force enable > /dev/null 2>&1 || true
echo "  UFW: ports 22, 80, 443 open"
EOF
ok "All services started."

# ── Final status ───────────────────────────────────────────
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "  ${CYAN}URL:${NC}         http://$DOMAIN"
echo -e "  ${CYAN}Admin:${NC}       admin@bilimportal.tm / admin123"
echo -e "  ${CYAN}User:${NC}        okuwcy@bilimportal.tm / user1234"
echo ""
echo -e "  ${CYAN}Server status:${NC}"
remote << 'EOF'
export PATH="$(npm prefix -g)/bin:$PATH"
echo "  Node    : $(node -v)"
echo "  PM2     : $(pm2 list 2>/dev/null | grep bilimportal | awk '{print $10}' || echo 'unknown')"
echo "  Nginx   : $(systemctl is-active nginx)"
echo "  UFW     : $(ufw status 2>/dev/null | head -1)"
echo "  Port    : $(ss -tlnp 2>/dev/null | grep 3000 | awk '{print $4}' || echo 'not up yet')"
EOF
echo ""
