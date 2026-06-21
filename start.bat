@echo off
chcp 65001 >nul 2>&1
title SCCoo - Dev Server
cd /d "%~dp0"

echo ============================================
echo   SCCoo Tattoo Portal
echo ============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found
    pause
    exit /b 1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1

if not exist "node_modules\" (
    echo Installing dependencies...
    call pnpm install
)

echo Setting up database...
call pnpm --filter @sccoo/db db:push >nul 2>&1
call pnpm db:seed >nul 2>&1

if not exist "apps\web\.env" (
    echo DATABASE_URL="file:D:/DingDan/sccoo/packages/db/prisma/dev.db" > "apps\web\.env"
    echo NEXTAUTH_SECRET="dev-secret" >> "apps\web\.env"
    echo NEXTAUTH_URL="http://localhost:3000" >> "apps\web\.env"
)

echo.
echo Test Accounts:
echo   Admin : admin@sccoo.cn / 123456
echo   User  : artist1@test.com / 123456
echo.
echo Starting at http://localhost:3000 ...
echo.

cd apps\web
start "" http://localhost:3000
call pnpm dev
pause
