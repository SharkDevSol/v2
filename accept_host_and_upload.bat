@echo off
REM ============================================================
REM WARNING: This script contains deployment credentials.
REM Set these environment variables before running:
REM   set SSH_HOST=your-server-ip
REM   set SSH_USER=root
REM   set SSH_PASSWORD=your-password
REM   set DEPLOY_PATH=/var/www/skoolific/iqrab3/APP/dist/index.html
REM ============================================================
echo y | plink -pw "%SSH_PASSWORD%" %SSH_USER%@%SSH_HOST% "exit"
timeout /t 2 /nobreak >nul
pscp -pw "%SSH_PASSWORD%" APP\dist\index.html %SSH_USER%@%SSH_HOST%:%DEPLOY_PATH%
plink -pw "%SSH_PASSWORD%" %SSH_USER%@%SSH_HOST% "systemctl reload nginx"
echo.
echo ============================================================
echo DEPLOYMENT COMPLETE!
echo ============================================================
echo.
echo User must now:
echo 1. Clear browser cache (Ctrl+Shift+Delete)
echo 2. Close ALL tabs for iqrab3.skoolific.com
echo 3. Restart browser completely
echo 4. Open iqrab3.skoolific.com in fresh tab
echo 5. Check console for: Students with existing marks:
echo 6. Test: Fill marks, Save, Refresh - Should stay locked
echo.
pause
