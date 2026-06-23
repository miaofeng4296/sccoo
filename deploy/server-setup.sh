#!/bin/bash
set -e

# ============================================
# SCCoo Server Setup - All in One
# Run from Tencent Cloud web terminal:
# curl -fsSL https://raw.githubusercontent.com/miaofeng4296/sccoo/master/腾讯云相关/server-setup.sh | bash
# ============================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "  SCCoo Server Setup"
echo "========================================"
echo ""

# -------- Generate Secrets --------
echo "[1/8] Generating secrets..."
DB_PASSWORD=$(openssl rand -base64 16 2>/dev/null || tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 48)
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "124.156.138.2")
echo "  Server IP: $SERVER_IP"

# -------- Install Docker --------
echo "[2/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "  Docker installed."
else
    echo "  Docker already installed."
fi

# -------- Install Docker Compose --------
echo "[3/8] Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt-get update -qq
    apt-get install -y -qq docker-compose-plugin
    echo "  Docker Compose installed."
else
    echo "  Docker Compose already installed."
fi

# -------- Install Nginx --------
echo "[4/8] Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get update -qq
    apt-get install -y -qq nginx
    echo "  Nginx installed."
else
    echo "  Nginx already installed."
fi

# -------- Clone / Update Repo --------
echo "[5/8] Fetching code..."
if [ -d /opt/sccoo/.git ]; then
    cd /opt/sccoo
    git pull origin master
    echo "  Code updated."
else
    rm -rf /opt/sccoo
    git clone https://github.com/miaofeng4296/sccoo.git /opt/sccoo
    echo "  Code cloned."
fi

# -------- Setup Environment --------
echo "[6/8] Setting up environment..."
cd /opt/sccoo

cat > .env << EOF
DB_PASSWORD=${DB_PASSWORD}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://${SERVER_IP}
EOF
echo "  .env created."

# -------- Build & Start --------
echo "[7/8] Building and starting services..."
echo "  This will take 5-10 minutes..."
docker compose --env-file .env down 2>/dev/null || true
docker compose --env-file .env up -d --build 2>&1 | tail -20

echo "  Waiting 15 seconds for startup..."
sleep 15

# -------- Initialize Database --------
echo "[8/8] Initializing database..."
docker compose exec -T app sh -c "cd packages/db && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts" 2>&1 || true

# -------- Configure Nginx --------
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/sccoo << 'NGINXEOF'
server {
    listen 80 default_server;
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/sccoo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# -------- Done --------
echo ""
echo -e "${GREEN}========================================"
echo "  Deployment Complete!"
echo -e "========================================${NC}"
echo ""
echo "  URL:  http://${SERVER_IP}"
echo "  SSH:  ssh root@${SERVER_IP}"
echo "  Logs: docker compose -f /opt/sccoo/docker-compose.yml logs -f"
echo ""
echo -e "${YELLOW}Database password: ${DB_PASSWORD}${NC}"
echo -e "${YELLOW}NextAuth secret:   ${NEXTAUTH_SECRET}${NC}"
echo ""
