/**
 * Konfigurasi PM2 Process Manager untuk Menjalankan WA Gateway 24 Jam Non-Stop
 */
module.exports = {
  apps: [
    {
      name: 'wa-gateway-suntiksosmed',
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
  ],
};
