module.exports = {
    apps: [
        {
            name: 'waivio-auth',
            script: './bin/service.js',
            env: {
                API_KEY: '49868f4a-9e89-4e3f-8b8a-0691730d42e0',
                ACCESS_KEY: '6d6ca723-d621-4001-96ee-1978f552473f',
                REFRESH_KEY: '3ff7606f-8247-44a8-a4ae-1349ae823373',
                COMMON_VARIABLE: 'true',
                PORT: '8004',
                FACEBOOK_APP_ID: '754038848413420',
                FACEBOOK_APP_SECRET: '6d0255aa0abd3f68bce0ba4314e16dbd',
                GOOGLE_APP_ID: '623736583769-qlg46kt2o7gc4kjd2l90nscitf38vl5t.apps.googleusercontent.com',
                GOGGLE_APP_SECRET: '7vMRiac-95WEcNbKvubfsqsE'
            }
        }
    ],
    deploy: {
        production: {
            user: 'admin',
            host: '157.230.93.18',
            ref: 'origin/master',
            repo: 'git@github.com:Waiviogit/waivioAuth.git',
            'env': {
                'NODE_ENV': 'production'
            },
            path: '/home/admin/waivio-auth',
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
