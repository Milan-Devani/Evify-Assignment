#!/usr/bin/env bash
# ==============================================================================
# Evify Fleet Management Backend - Ubuntu EC2 Deployment Script
# ==============================================================================

set -e

echo ">>> [1/7] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential

echo ">>> [2/7] Installing Node.js 18.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ">>> [3/7] Installing PM2 globally..."
sudo npm install -g pm2

echo ">>> [4/7] Preparing application directory..."
APP_DIR="/var/www/evify-backend"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

if [ ! -d "$APP_DIR/.git" ]; then
  echo ">>> Cloning repository..."
  # Replace with actual git repository URL if deploying via git
  # git clone <YOUR_GIT_REPO_URL> $APP_DIR
fi

cd $APP_DIR

echo ">>> [5/7] Installing production dependencies..."
npm install --omit=dev

echo ">>> [6/7] Configuring environment variables..."
if [ ! -f "$APP_DIR/.env" ]; then
  cat << 'EOF' > $APP_DIR/.env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/evify_production?retryWrites=true&w=majority
JWT_SECRET=production_super_secure_jwt_secret_key_2026_evify
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com
EOF
  echo "Created default .env template. Please update with real credentials!"
fi

echo ">>> [7/7] Starting application with PM2..."
pm2 stop evify-backend || true
pm2 start src/server.js --name evify-backend -i max
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

echo "=============================================================================="
echo " Deployment Complete! Server is active on port 5000"
echo " Use 'pm2 logs evify-backend' to view real-time logs."
echo "=============================================================================="
