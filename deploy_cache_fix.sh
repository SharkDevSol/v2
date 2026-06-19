#!/bin/bash
# Deploy script — set SSH_HOST, SSH_USER, SSH_PASSWORD env vars first
# Usage: SSH_HOST=your-server SSH_USER=root SSH_PASSWORD=your-pass ./deploy_cache_fix.sh

HOST="${SSH_HOST:-76.13.48.245}"
USER="${SSH_USER:-root}"
PASS="${SSH_PASSWORD}"

if [ -z "$PASS" ]; then
  echo "❌ Set SSH_PASSWORD environment variable"
  exit 1
fi

echo "🚀 Deploying to $HOST..."
sshpass -p "$PASS" scp APP/dist/index.html ${USER}@${HOST}:/var/www/skoolific/iqrab3/APP/dist/
echo "🔄 Reloading Nginx..."
sshpass -p "$PASS" ssh ${USER}@${HOST} "systemctl reload nginx"
echo "✅ Deployment complete!"
