module.exports = {
  apps: [
    {
      name: "bilimportal",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/bilimportal",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      error_file: "/var/log/bilimportal/error.log",
      out_file: "/var/log/bilimportal/out.log",
      log_file: "/var/log/bilimportal/combined.log",
      time: true,
    },
  ],
};
