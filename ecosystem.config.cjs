module.exports = {
  apps: [
    {
      name: 'cloverfit',
      script: 'npx',
      args: 'wrangler pages dev dist --persist-to /home/user/webapp/.wrangler/state --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
