module.exports = {
    apps: [
        {
            name: 'waivio-auth',
            script: './bin/service.js',
            env: {
                COMMON_VARIABLE: 'true',
                PORT: '8004'
            }
        }
    ],
    deploy: {
        production: {
            user: 'admin',
            host: '157.230.93.18',
            ref: 'origin/master',
            repo: 'git@github.com:Waiviogit/waivioAuth.git',
            path: '/home/teamcity/waivio-auth',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env production'
        },
        staging: {
            user: 'teamcity',
            host: '35.157.207.192',
            ref: 'origin/staging',
            repo: 'git@github.com:Waiviogit/waivioAuth.git',
            path: '/home/teamcity/waivio-auth',
            ssh_options: [ 'StrictHostKeyChecking=no' ],
            'env': {
                'NODE_ENV': 'staging'
            },
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env staging'
        }
    }
};
