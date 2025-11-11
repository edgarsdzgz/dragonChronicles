@echo off
REM Script to rebuild packages and clear all caches
REM Use this when dev server is not picking up package changes

echo 🧹 Clearing all caches...

REM Clear Vite cache
if exist apps\web\.vite rmdir /s /q apps\web\.vite
if exist apps\web\node_modules\.vite rmdir /s /q apps\web\node_modules\.vite
echo ✅ Cleared Vite cache

REM Clear TypeScript build info
del /s /q packages\*\tsconfig.tsbuildinfo 2>nul
echo ✅ Cleared TypeScript build info

REM Clear package dist folders
if exist packages\shared\dist rmdir /s /q packages\shared\dist
if exist packages\db\dist rmdir /s /q packages\db\dist
echo ✅ Cleared package dist folders

echo.
echo 🔨 Rebuilding packages...

REM Rebuild shared package first (db depends on it)
cd packages\shared
call pnpm run build
echo ✅ Built @draconia/shared

REM Rebuild db package
cd ..\db
call pnpm run build
echo ✅ Built @draconia/db

cd ..\..

echo.
echo ✅ All done! Now restart your dev server:
echo    cd apps\web
echo    pnpm run dev
echo.
echo Then do a hard refresh in browser (Ctrl+Shift+R)
