#!/bin/bash
# SCCoo 一键部署脚本
# 用法: bash deploy.sh [server_ip] [domain]
# 示例: bash deploy.sh 43.156.12.34 sccoo.cn

set -e

SERVER_IP="${1}"
DOMAIN="${2}"
SSH_USER="root"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SCCoo 一键部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

if [ -z "$SERVER_IP" ]; then
  echo -e "${RED}错误: 请提供服务器 IP${NC}"
  echo "用法: bash deploy.sh <server_ip> [domain]"
  echo "示例: bash deploy.sh 43.156.12.34 sccoo.cn"
  exit 1
fi

echo ""
echo -e "${YELLOW}服务器 IP: ${SERVER_IP}${NC}"
if [ -n "$DOMAIN" ]; then
  echo -e "${YELLOW}域名: ${DOMAIN}${NC}"
else
  echo -e "${YELLOW}域名: 未设置（将使用 IP 访问）${NC}"
fi
echo ""

# 1. Generate NexAuth secret
echo -e "${GREEN}[1/6] 生成密钥...${NC}"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16)
echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}"
echo "DB_PASSWORD=${DB_PASSWORD}"

# 2. Create .env.production
echo -e "${GREEN}[2/6] 创建环境配置...${NC}"
cat > .env.production << EOF
DB_PASSWORD=${DB_PASSWORD}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://${DOMAIN:-${SERVER_IP}}
EOF
echo "已生成 .env.production"

# 3. Upload project to server
echo -e "${GREEN}[3/6] 上传项目文件到服务器...${NC}"
ssh ${SSH_USER}@${SERVER_IP} "mkdir -p /opt/sccoo"
rsync -avz --exclude 'node_modules' \
           --exclude '.next' \
           --exclude '.turbo' \
           --exclude '.git' \
           --exclude '*.db' \
           --exclude 'backups' \
           ./ ${SSH_USER}@${SERVER_IP}:/opt/sccoo/

# 4. Copy env file
scp .env.production ${SSH_USER}@${SERVER_IP}:/opt/sccoo/.env

# 5. Install Docker & deploy on server
echo -e "${GREEN}[5/6] 在服务器上安装 Docker 并部署...${NC}"
ssh ${SSH_USER}@${SERVER_IP} << 'ENDSCRIPT'
set -e

# Install Docker (if not installed)
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose plugin (if not installed)
if ! docker compose version &> /dev/null; then
    echo "安装 Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# Install Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt-get update && apt-get install -y nginx certbot python3-certbot-nginx
fi

cd /opt/sccoo

# Stop existing containers
docker compose down 2>/dev/null || true

# Build and start
echo "构建并启动服务..."
docker compose --env-file .env up -d --build

echo "等待服务就绪..."
sleep 10
docker compose ps

# Setup Nginx
DOMAIN=$(grep NEXTAUTH_URL .env | cut -d'=' -f2 | sed 's|https://||')

if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "null" ]; then
    cat > /etc/nginx/sites-available/sccoo << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads/ {
        alias /opt/sccoo/apps/web/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

    ln -sf /etc/nginx/sites-available/sccoo /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx

    # SSL Certificate
    echo "申请 SSL 证书..."
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || true
else
    # IP-only mode
    cat > /etc/nginx/sites-available/sccoo << NGINXEOF
server {
    listen 80 default_server;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF

    ln -sf /etc/nginx/sites-available/sccoo /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
fi

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
ENDSCRIPT

echo -e "${GREEN}[6/6] 清理本地临时文件...${NC}"
rm -f .env.production

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "访问地址: ${YELLOW}https://${DOMAIN:-${SERVER_IP}}${NC}"
echo ""
echo -e "查看日志: ssh ${SSH_USER}@${SERVER_IP} 'cd /opt/sccoo && docker compose logs -f'"
echo -e "重启服务: ssh ${SSH_USER}@${SERVER_IP} 'cd /opt/sccoo && docker compose restart'"
echo ""
echo -e "${RED}重要备忘:${NC}"
echo "  - Admin 账号需要在服务器上手动创建:"
echo "    ssh ${SSH_USER}@${SERVER_IP} 'cd /opt/sccoo && docker compose exec app sh'"
echo "    然后运行数据库 seed 或注册账号后手动改 role 为 ADMIN"
echo ""
