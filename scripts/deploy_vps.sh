#!/bin/bash

# ==============================================================================
# SCRIPT OTOMATIS INSTALLASI & DEPLOYMENT VirexID DI VPS UBUNTU/DEBIAN
# ==============================================================================

echo "======================================================================"
echo "🚀 MEMULAI SETUP DEPLOYMENT AUTOMATION VirexID DI VPS..."
echo "======================================================================"

# 1. Update Paket Sistem VPS
echo "\n📦 1. Update Repository & Install Prasyarat System..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw sqlite3

# 2. Install Node.js 20 LTS & npm
echo "\n🟢 2. Install Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "Node.js Version:" $(node -v)
echo "npm Version:" $(npm -v)

# 3. Install PM2 Globally
echo "\n⚙️ 3. Install PM2 Process Manager Global..."
sudo npm install -g pm2

# 4. Clone / Pull Repository
TARGET_DIR="/var/www/VirexID"
echo "\n📁 4. Setting Direktori Project di $TARGET_DIR..."

if [ ! -d "$TARGET_DIR" ]; then
    echo "Menarik kode dari GitHub Repository..."
    sudo git clone https://github.com/alfarizyalief9-max/VirexID.git $TARGET_DIR
    sudo chown -R $USER:$USER $TARGET_DIR
else
    echo "Direktori sudah ada. Melakukan git pull terbaru..."
    cd $TARGET_DIR
    git pull origin main
fi

cd $TARGET_DIR

# 5. Install Dependencies
echo "\n📥 5. Menginstall Dependensi npm..."
npm install

# 6. Setup Environment File
if [ ! -f ".env" ]; then
    echo "Membuat file .env dari template .env.production..."
    cp .env.production .env
    echo "⚠️ Silakan edit file /var/www/VirexID/.env untuk memasukkan DUMPEDIA_API_KEY & ADMIN_PASSWORD Anda!"
fi

# 7. Database Migration & Seed
echo "\n🗄️ 7. Menjalankan Prisma Migration & Seeder Database SQLite..."
npx prisma migrate deploy
npm run prisma:seed

# 8. Build Next.js Production Bundle
echo "\n🏗️ 8. Membangun Production Bundle Next.js..."
npm run build

# 9. Firewall UFW Rules
echo "\n🛡️ 9. Membuka Port Firewall (22, 80, 443, 3000, 3001)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable

# 10. Start Services dengan PM2
echo "\n🚀 10. Menjalankan WA Gateway & Next.js Website via PM2 24/7..."
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Dapatkan IP Public VPS
PUBLIC_IP=$(curl -s https://api.ipify.org)

echo "\n======================================================================"
echo "🎉 DEPLOYMENT BERHASIL SELESAI AKTIFF 24 JAM!"
echo "======================================================================"
echo "🌐 Website Etalase & Admin : http://$PUBLIC_IP:3000"
echo "🔐 Login Admin Dashboard   : http://$PUBLIC_IP:3000/admin/login"
echo "🤖 WA Gateway Service Status: http://$PUBLIC_IP:3001/status"
echo "======================================================================"
echo "📌 IP PUBLIC VPS ANDA ADALAH: $PUBLIC_IP"
echo "👉 DAFTARKAN IP '$PUBLIC_IP' INI KE WHITELIST DUMPEDIA.ID ANDA!"
echo "======================================================================"
echo "\n📱 SCAN QR CODE WHATSAPP GATEWAY:"
echo "Jalankan perintah ini di SSH VPS untuk scan QR code WA:"
echo "   pm2 logs wa-gateway-service"
echo "======================================================================\n"
