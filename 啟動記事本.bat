@echo off
chcp 65001 >nul
title PWA 記事本 - 開發伺服器
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════╗
echo ║       PWA 記事本 - 啟動中...          ║
echo ╚══════════════════════════════════════╝
echo.

echo 正在啟動開發伺服器...
echo 瀏覽器將自動開啟 http://localhost:5173/
echo.
echo 按 Ctrl+C 可停止伺服器
echo ──────────────────────────────────────
echo.

npm run dev -- --open
