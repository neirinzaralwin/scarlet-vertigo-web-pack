#!/bin/bash

# Server setup script for scarlet-vertigo deployment
# This script should be run on your server to prepare the environment

echo "🚀 Setting up Scarlet Vertigo deployment environment..."

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please logout and login again to apply group changes."
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed."
fi

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/admin/scarlet-vertigo-app
cd /home/admin/scarlet-vertigo-app

# Create MongoDB SSH tunnel service
echo "🔧 Setting up MongoDB SSH tunnel service..."
sudo tee /etc/systemd/system/mongodb-tunnel.service > /dev/null <<EOF
[Unit]
Description=MongoDB SSH Tunnel
After=network.target

[Service]
Type=simple
User=admin
ExecStart=/usr/bin/ssh -i /home/admin/.ssh/scarlet_vertigo_ssh -L 27017:127.0.0.1:27017 -N admin@193.180.211.65
Restart=always
RestartSec=5
KillMode=process

[Install]
WantedBy=multi-user.target
EOF

# Make sure SSH key has correct permissions
echo "🔐 Setting SSH key permissions..."
chmod 600 /home/admin/.ssh/scarlet_vertigo_ssh

# Enable and start the MongoDB tunnel service
echo "🚀 Starting MongoDB tunnel service..."
sudo systemctl daemon-reload
sudo systemctl enable mongodb-tunnel.service
sudo systemctl start mongodb-tunnel.service

# Check if tunnel is working
echo "✅ Checking MongoDB tunnel status..."
sudo systemctl status mongodb-tunnel.service --no-pager -l

echo "🎉 Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy your SSH private key to /home/admin/.ssh/scarlet_vertigo_ssh"
echo "2. Set up GitHub repository secrets:"
echo "   - HOST: 193.180.211.65"
echo "   - USERNAME: admin"
echo "   - SSH_PRIVATE_KEY: (content of your scarlet_vertigo_ssh private key)"
echo "   - SSH_PORT: 22 (optional, defaults to 22)"
echo "3. Push to main branch to trigger deployment"
echo ""
echo "Useful commands:"
echo "- Check tunnel status: sudo systemctl status mongodb-tunnel.service"
echo "- Restart tunnel: sudo systemctl restart mongodb-tunnel.service"
echo "- View deployment logs: docker-compose -f docker-compose.prod.yml logs"
