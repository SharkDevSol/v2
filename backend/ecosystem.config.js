module.exports = {
  apps: [{
    name: 'skoolific-backend',
    script: 'server.js',
    cwd: __dirname,
    env: {
      NODE_ENV: 'development',
      PORT: 5052
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5052
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 3000,
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    time: true
  }]
};
