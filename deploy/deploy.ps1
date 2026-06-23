# SCCoo Tencent Cloud One-Click Deploy
# Run: powershell -ExecutionPolicy Bypass -File deploy.ps1

$ServerIP   = "124.156.138.2"
$ServerUser = "root"
$ProjectDir = "D:\DingDan\sccoo"
$RemoteDir  = "/opt/sccoo"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  SCCoo Tencent Cloud Deploy" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Server: $ServerIP"

# ============================================
# Step 1: Generate secrets
# ============================================
Write-Host "[1/5] Generating secrets..." -ForegroundColor Cyan

$DB_PASSWORD     = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | % {[char]$_})
$NEXTAUTH_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | % {[char]$_})

@"
DB_PASSWORD=${DB_PASSWORD}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://${ServerIP}
"@ | Out-File -FilePath "$ProjectDir\.env" -Encoding ASCII

Write-Host "  Done." -ForegroundColor Green

# ============================================
# Step 2: Create remote setup script
# ============================================
Write-Host "[2/5] Creating remote setup script..." -ForegroundColor Cyan

@"
#!/bin/bash
set -e

echo "--- Installing Docker ---"
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "--- Installing Docker Compose & Nginx ---"
apt-get update -qq
apt-get install -y -qq docker-compose-plugin nginx

echo "--- Starting services ---"
cd ${RemoteDir}
docker compose --env-file .env down 2>/dev/null || true
docker compose --env-file .env up -d --build

echo "--- Waiting for services (15s) ---"
sleep 15

echo "--- Initializing database ---"
docker compose exec -T app sh -c "cd packages/db && npx prisma db push && npx tsx prisma/seed.ts" || true

echo "--- Configuring Nginx ---"
cat > /etc/nginx/sites-available/sccoo << 'NGINXEOF'
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

echo ""
echo "========================================"
echo "  Deploy Complete!"
echo "  Open: http://${ServerIP}"
echo "========================================"
"@ | Out-File -FilePath "$ProjectDir\setup-remote.sh" -Encoding ASCII -NoNewline

# Fix line endings to LF for Linux
$content = Get-Content "$ProjectDir\setup-remote.sh" -Raw
$content = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText("$ProjectDir\setup-remote.sh", $content, [System.Text.Encoding]::ASCII)

Write-Host "  Done." -ForegroundColor Green

# ============================================
# Step 3: Package project
# ============================================
Write-Host "[3/5] Packaging project..." -ForegroundColor Cyan

Set-Location $ProjectDir

tar --exclude=node_modules `
    --exclude=.next `
    --exclude=.turbo `
    --exclude=.git `
    --exclude="*.db" `
    --exclude=backups `
    -czf sccoo.tar.gz .

Write-Host "  Done." -ForegroundColor Green

# ============================================
# Step 4: Upload to server
# ============================================
Write-Host "[4/5] Uploading to server..." -ForegroundColor Cyan

scp sccoo.tar.gz setup-remote.sh ${ServerUser}@${ServerIP}:/opt/

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Upload failed!" -ForegroundColor Red
    Remove-Item sccoo.tar.gz, setup-remote.sh -ErrorAction SilentlyContinue
    pause
    exit 1
}

Remove-Item sccoo.tar.gz, setup-remote.sh -ErrorAction SilentlyContinue
Write-Host "  Done." -ForegroundColor Green

# ============================================
# Step 5: Run remote setup
# ============================================
Write-Host "[5/5] Running remote setup..." -ForegroundColor Cyan
Write-Host "  (build takes 5-10 min, please wait...)" -ForegroundColor Yellow

ssh ${ServerUser}@${ServerIP} "mkdir -p ${RemoteDir} && cd /opt && tar -xzf sccoo.tar.gz -C ${RemoteDir}/ && rm sccoo.tar.gz && bash /opt/setup-remote.sh && rm /opt/setup-remote.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Remote setup failed!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "  http://${ServerIP}" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  SSH  : ssh root@${ServerIP}" -ForegroundColor Gray
Write-Host "  Logs : ssh root@${ServerIP} 'docker compose -f ${RemoteDir}/docker-compose.yml logs -f'" -ForegroundColor Gray
Write-Host ""
pause
