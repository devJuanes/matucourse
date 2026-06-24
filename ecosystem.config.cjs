/** PM2 — fallback local si Nginx no está configurado. Producción usa Nginx → dist/ */
module.exports = {
  apps: [
    {
      name: 'matucourse',
      cwd: __dirname,
      script: 'node_modules/serve/bin/serve.js',
      args: ['dist', '-l', '3030', '-s'],
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
