module.exports = {
  apps: [
    {
      name: "Accountant",    // Process name
      script: "npm",
      args: "start --",
      env: {
        NODE_ENV: "production"
      },
      env_production: require('dotenv').config().parsed  
    }
  ]
};
    