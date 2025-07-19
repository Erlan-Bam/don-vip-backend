module.exports = {
  apps: [
    {
      name: 'don-vip-frontend',
      script: 'bash',
      args: ['-c', 'PORT=3000 yarn start'],
      cwd: '/var/www/don-vip',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'don-vip-1',
      script: 'bash',
      args: ['-c', 'PORT=3001 yarn start:prod'],
      cwd: '/var/www/don-vip-backend'
    },
    {
      name: 'don-vip-2',
      script: 'bash',
      args: ['-c', 'PORT=3002 yarn start:prod'],
      cwd: '/var/www/don-vip-backend'
    },
    {
      name: 'don-vip-3',
      script: 'bash',
      args: ['-c', 'PORT=3003 yarn start:prod'],
      cwd: '/var/www/don-vip-backend'
    },
    {
      name: 'don-vip-4',
      script: 'bash',
      args: ['-c', 'PORT=3004 yarn start:prod'],
      cwd: '/var/www/don-vip-backend'
    },
    {
      name: 'don-vip-admin',
      script: 'bash',
      args: ['-c', 'PORT=3010 yarn start'],
      cwd: '/var/www/donvip-admin-panel',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}

