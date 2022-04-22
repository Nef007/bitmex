module.exports = {
  apps : [{
    name   : "app",
    script : "./app.js",
    max_memory_restart: '3G',
    instances: 3,
    exec_mode: 'cluster',
    out_file: "../out.log",
    error_file: "../error.log",
    max_restart: 10,
    autorestart: true,
    restart_delay: 4000,
    wait_ready: true,


    env: {
      NODE_ENV: "production",
      PORT: 443,
      JWT_SECRET: 'Dkfl',
      PASSWORD: '12345678'
    },

  }],
  deploy : {
    production : {
      user : "root",
      host : "45.84.226.201",
      repo : "https://github.com/Nef007/bitmex.git",
      ref  : "origin/master",
      path : "/home/bitmex",
      'post-deploy' : " npm run client:build && pm2 startOrRestart ecosystem.config.js",
      env: {
        NODE_ENV: "production",
      }
    },

    // test : {
    //   user : "root",
    //   host : "10.40.52.237",
    //   repo : "http://10.40.52.236/nef007/parsiv.git",
    //   ref  : "origin/dev",
    //   path : "/home/parsiv",
    //   'post-deploy' : "npm run client:build && pm2 startOrRestart ecosystem.configDB.js",
    //   env: {
    //     NODE_ENV: "production"
    //   }
    // }
  }
}
