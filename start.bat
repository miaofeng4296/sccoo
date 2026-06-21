@echo off
chcp 65001 >nul 2>&1
title SCCoo Dev Server
cd /d "%~dp0"
echo SCCoo Tattoo Portal - Dev Server
echo http://localhost:3000
echo.

:: Kill old server
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING" 2^>nul') do taskkill /F /PID %%a >nul 2>&1

:: Install
if not exist "node_modules\" pnpm install

:: DB push + seed
pnpm --filter @sccoo/db db:push --skip-generate >nul 2>&1
pnpm db:seed >nul 2>&1

:: Create .env if missing
if not exist "apps\web\.env" (
  echo DATABASE_URL^=file:D:/DingDan/sccoo/packages/db/prisma/dev.db > apps\web\.env
  echo NEXTAUTH_SECRET^=dev-secret >> apps\web\.env
  echo NEXTAUTH_URL^=http://localhost:3000 >> apps\web\.env
)

echo.
echo Test Accounts:
echo   Admin : admin@sccoo.cn / 123456
echo   User  : artist1@test.com / 123456
echo.
echo Starting at http://localhost:3000 ...
echo.

pnpm dev --filter web
pause
