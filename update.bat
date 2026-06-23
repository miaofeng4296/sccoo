@echo off
chcp 65001 >nul
title SCCoo Deploy

set SERVER=124.156.138.2
set KEY=%USERPROFILE%\.ssh\sccoo

echo ========================================
echo  SCCoo One-Click Deploy
echo ========================================

echo.
echo [1/3] Commit and push...
cd /d "D:\DingDan\sccoo"
git add -A
git commit -m "update: %date% %time%"
git push origin master

if errorlevel 1 (
    echo WARN: Git push may have failed, continuing anyway...
)

echo.
echo [2/3] Deploy to server...
ssh -i "%KEY%" -o StrictHostKeyChecking=no root@%SERVER% "cd /opt/sccoo && git pull origin master"

echo.
echo [3/3] Rebuild and restart...
ssh -i "%KEY%" -o StrictHostKeyChecking=no root@%SERVER% "cd /opt/sccoo && git pull origin master && docker compose --env-file .env up -d --build"

echo.
echo ========================================
echo  Done! http://%SERVER%
echo ========================================
pause
