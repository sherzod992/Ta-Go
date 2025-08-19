module.exports = {
    apps: [
        {
            name: 'ta-go',
            script: 'npm',
            args: 'start',
            cwd: '/var/www/ta-go',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3011
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3011
            }
        }
    ]
};
