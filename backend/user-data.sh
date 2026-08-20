#!/bin/bash
# ==============================================================================
# AWS EC2 User Data Script - Automated Bootstrap for Evify Fleet Backend
# ==============================================================================

# Redirect stdout and stderr to log file
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo ">>> Starting automated EC2 provisioning..."

# 1. Update OS packages
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx build-essential

# 2. Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Install PM2 process manager
npm install -g pm2

# 4. Create App directory
mkdir -p /var/www/evify-backend
cd /var/www/evify-backend

# 5. Clone repository or pull from S3/Artifact registry
# git clone https://github.com/your-org/evify-backend.git .

# 6. Install dependencies
# npm install --production

# 7. Configure Nginx Reverse Proxy
cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

systemctl restart nginx

# 8. Start with PM2 (once code is deployed)
# pm2 start src/server.js --name evify-backend -i max
# pm2 startup systemd
# pm2 save

echo ">>> EC2 Instance successfully provisioned!"
