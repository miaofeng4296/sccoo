@echo off
chcp 65001 >nul
title 秀酷纹身之家 - 开发服务器

echo.
echo ╔══════════════════════════════════════════════╗
echo ║       秀酷纹身之家 (sccoo.cn) 开发服务器       ║
echo ╚══════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 检查 pnpm
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [信息] 正在安装 pnpm...
    npm install -g pnpm
)

:: 安装依赖
if not exist "node_modules" (
    echo [1/4] 正在安装依赖，请稍候...
    call pnpm install
) else (
    echo [1/4] 依赖已安装 ✓
)

:: 推送数据库 Schema
echo [2/4] 同步数据库...
call pnpm --filter @sccoo/db db:push
if %errorlevel% neq 0 (
    echo [错误] 数据库同步失败
    pause
    exit /b 1
)

:: 填充种子数据
echo [3/4] 填充种子数据...
call pnpm db:seed
if %errorlevel% neq 0 (
    echo [警告] 种子数据可能已存在，继续启动...
)

:: 创建 .env（如果不存在）
if not exist "apps\web\.env" (
    echo DATABASE_URL="file:D:/DingDan/sccoo/packages/db/prisma/dev.db" > apps\web\.env
    echo NEXTAUTH_SECRET="dev-secret-change-in-production-123456789" >> apps\web\.env
    echo NEXTAUTH_URL="http://localhost:3000" >> apps\web\.env
)

:: 启动开发服务器
echo [4/4] 启动开发服务器...
echo.
echo ╔══════════════════════════════════════════════╗
echo ║ 测试账号                                     ║
echo ║   管理员: admin@sccoo.cn / 123456            ║
echo ║   普通用户: artist1@test.com / 123456        ║
echo ║                                             ║
echo ║ 浏览器打开: http://localhost:3000            ║
echo ║ 按 Ctrl+C 停止服务器                         ║
echo ╚══════════════════════════════════════════════╝
echo.

call pnpm dev --filter web

pause
