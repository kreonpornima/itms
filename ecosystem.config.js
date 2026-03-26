module.exports = {
    apps: [{
      name: 'itms',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: 'C:\\itms',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXTAUTH_SECRET: 'your-secret-here',
        NEXTAUTH_URL: 'http://106.201.231.148:3000',
        DATABASE_URL: 'your-actual-database-url'
      }
    }]
  }