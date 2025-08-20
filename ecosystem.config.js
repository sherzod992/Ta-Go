module.exports = {
    apps: [
        {
            name: 'ta-go-backend',
            script: 'npm',
            args: 'start',
            cwd: '/var/www/ta-go-backend',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'ta-go-frontend',
            script: 'npx',
            args: 'serve@latest out -p 80',
            cwd: '/var/www/ta-go',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
                PORT: 80
            }
        }
    ]
};
