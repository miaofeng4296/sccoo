@echo off
setlocal enabledelayedexpansion
title SCCoo Deploy

set SERVER_IP=124.156.138.2
set SERVER_USER=root
set PROJECT_DIR=D:\DingDan\sccoo
set REMOTE_DIR=/opt/sccoo

echo ========================================
echo   SCCoo Tencent Cloud Deploy
echo ========================================
echo.
echo Server: %SERVER_IP%
echo Project: %PROJECT_DIR%
echo.
echo You will need to enter password twice:
echo   once for upload, once for deploy.
echo Password: Tx2874mf
echo.

cd /d "%PROJECT_DIR%"

:: ============================================
:: Step 1: Generate secrets and env file
:: ============================================
echo [1/5] Generating secrets...

for /f "tokens=2 delims==" %%a in ('powershell -Command "[Convert]::ToBase64String((1..32|%%{Get-Random -Max 256}))"') do set NEXTAUTH_SECRET=%%a
for /f "tokens=2 delims==" %%a in ('powershell -Command "[Convert]::ToBase64String((1..16|%%{Get-Random -Max 256}))"') do set DB_PASSWORD=%%a

(
echo DB_PASSWORD=!DB_PASSWORD!
echo NEXTAUTH_SECRET=!NEXTAUTH_SECRET!
echo NEXTAUTH_URL=http://%SERVER_IP%
) > "%PROJECT_DIR%\.env"

echo Done.

:: ============================================
:: Step 2: Create remote setup script
:: ============================================
echo [2/5] Creating remote setup script...

(
echo #!/bin/bash
echo set -e
echo.
echo echo "Installing Docker..."
echo curl -fsSL https://get.docker.com ^| sh
echo systemctl enable docker
echo systemctl start docker
echo.
echo echo "Installing Docker Compose and Nginx..."
echo apt-get update -qq
echo apt-get install -y -qq docker-compose-plugin nginx
echo.
echo echo "Starting services..."
echo cd %REMOTE_DIR%
echo docker compose --env-file .env down 2^>/dev/null ^|^| true
echo docker compose --env-file .env up -d --build
echo.
echo echo "Waiting for services..."
echo sleep 15
echo.
echo echo "Initializing database..."
echo docker compose exec -T app sh -c "cd packages/db && npx prisma db push && npx tsx prisma/seed.ts"
echo.
echo echo "Configuring Nginx..."
echo cat ^> /etc/nginx/sites-available/sccoo ^<^< 'NGINXEOF'
echo server {
echo     listen 80 default_server;
echo     client_max_body_size 10M;
echo.
echo     location / {
echo         proxy_pass http://127.0.0.1:3000;
echo         proxy_http_version 1.1;
echo         proxy_set_header Upgrade \$http_upgrade;
echo         proxy_set_header Connection 'upgrade';
echo         proxy_set_header Host \$host;
echo         proxy_set_header X-Real-IP \$remote_addr;
echo         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto \$scheme;
echo     }
echo }
echo NGINXEOF
echo ln -sf /etc/nginx/sites-available/sccoo /etc/nginx/sites-enabled/
echo rm -f /etc/nginx/sites-enabled/default
echo nginx -t && systemctl reload nginx
echo.
echo echo "=========================================="
echo echo "  Deploy Complete!"
echo echo "  Open: http://%SERVER_IP%"
echo echo "=========================================="
) > "%PROJECT_DIR%\setup-remote.sh"

echo Done.

:: ============================================
:: Step 3: Package project
:: ============================================
echo [3/5] Packaging project...

tar --exclude=node_modules ^
    --exclude=.next ^
    --exclude=.turbo ^
    --exclude=.git ^
    --exclude=*.db ^
    --exclude=backups ^
    -czf sccoo.tar.gz .

echo Done.

:: ============================================
:: Step 4: Upload to server
:: ============================================
echo [4/5] Uploading to server...
echo Enter password: Tx2874mf

scp sccoo.tar.gz setup-remote.sh "%SERVER_USER%@%SERVER_IP%:/opt/"

if errorlevel 1 (
    echo ERROR: Upload failed!
    del sccoo.tar.gz setup-remote.sh
    pause
    exit /b 1
)

del sccoo.tar.gz setup-remote.sh
echo Done.

:: ============================================
:: Step 5: Run remote setup
:: ============================================
echo [5/5] Running remote setup...
echo Enter password again: Tx2874mf

ssh %SERVER_USER%@%SERVER_IP% "mkdir -p %REMOTE_DIR% && cd /opt && tar -xzf sccoo.tar.gz -C %REMOTE_DIR%/ && rm sccoo.tar.gz && bash /opt/setup-remote.sh && rm /opt/setup-remote.sh"

if errorlevel 1 (
    echo ERROR: Remote setup failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo   http://%SERVER_IP%
echo ========================================
echo.
echo   SSH into server: ssh root@%SERVER_IP%
echo   View logs: ssh root@%SERVER_IP% "docker compose -f /opt/sccoo/docker-compose.yml logs -f"
echo.
pause
