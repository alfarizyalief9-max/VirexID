/**
 * Konfigurasi PM2 Process Manager untuk Menjalankan Aplikasi 24 Jam Non-Stop di VPS
 * 1. wa-gateway-service: Service WA Gateway Baileys (Port 3001)
 * 2. nextjs-web-app: Website Etalase & Admin Dashboard Next.js (Port 3000)
 */
module.exports = {
  apps: [
    {
      name: 'wa-gateway-service',
      script: './gateway/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT_GATEWAY: 3001,
      },
    },
    {
      name: 'nextjs-web-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
