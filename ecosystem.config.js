module.exports = {
  apps: [
    {
      name: 'banhbaoshop',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: '/root/BanhBaoshop',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'file:./prod.db',
        JWT_SECRET: 'banhbao_super_secret_2026',
      },
    },
  ],
}
