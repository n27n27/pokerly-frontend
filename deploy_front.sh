#!/bin/bash
set -e

echo "▶️ Building front-end (Quasar build)..."
quasar build

echo "🧹 Cleaning old frontend files on server..."
ssh -i ~/.ssh/pokerly-ec2-key.pem ubuntu@pokerly.kr "rm -rf /srv/pokerly/frontend/*"

echo "📤 Uploading new build..."
scp -i ~/.ssh/pokerly-ec2-key.pem -r dist/spa/* \
  ubuntu@pokerly.kr:/srv/pokerly/frontend/

echo "✅ Frontend deploy completed!"
