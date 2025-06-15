const config = require('./jest.config');

// For unit tests, we don't need the global setup/teardown
delete config.setupFilesAfterEnv;
delete config.globalTeardown;

module.exports = config;