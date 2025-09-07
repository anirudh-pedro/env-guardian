const { EnvGuardian } = require('../index');

// Advanced usage with error handling
console.log('Advanced Configuration Example\n');

const guardian = new EnvGuardian({ 
  strict: false,  // Don't throw on validation errors
  loadDotenv: true 
});

const schema = {
  // Database configuration
  DATABASE_URL: { 
    type: 'url', 
    required: true,
    protocols: ['postgres', 'mysql', 'mongodb']
  },
  DB_POOL_SIZE: { 
    type: 'number', 
    min: 1, 
    max: 100, 
    default: 10 
  },
  
  // Redis configuration
  REDIS_URL: { 
    type: 'url', 
    protocols: ['redis'],
    default: 'redis://localhost:6379'
  },
  
  // Email settings
  SMTP_HOST: { type: 'string', default: 'localhost' },
  SMTP_PORT: { type: 'number', default: 587 },
  FROM_EMAIL: { type: 'email', required: true },
  
  // Application settings
  APP_NAME: { type: 'string', required: true },
  APP_VERSION: {
    type: (value, key) => {
      // Custom semantic version validator
      if (!/^\d+\.\d+\.\d+$/.test(value)) {
        throw new Error(`${key} must be a valid semantic version (e.g., 1.0.0)`);
      }
      return value;
    },
    default: '1.0.0'
  },
  
  // Feature flags
  FEATURES: {
    type: (value, key) => {
      try {
        const features = JSON.parse(value);
        if (typeof features !== 'object') {
          throw new Error(`${key} must be a JSON object`);
        }
        return features;
      } catch (error) {
        throw new Error(`${key} must be valid JSON`);
      }
    },
    default: '{"newUI": false, "betaFeatures": false}'
  },
  
  // Rate limiting
  RATE_LIMIT_WINDOW: { type: 'number', default: 900000 }, // 15 minutes
  RATE_LIMIT_MAX: { type: 'number', default: 100 },
  
  // Logging
  LOG_LEVEL: { 
    type: 'enum', 
    values: ['error', 'warn', 'info', 'debug'], 
    default: 'info' 
  }
};

const result = guardian.validate(schema);

console.log('Validation Results:');
console.log(`- Valid: ${result.isValid}`);
console.log(`- Errors: ${result.errors ? result.errors.length : 0}`);

if (result.errors) {
  console.log('\nValidation Errors:');
  result.errors.forEach(error => {
    console.log(`  - ${error.variable}: ${error.message}`);
  });
}

if (result.isValid) {
  console.log('\nConfiguration loaded successfully:');
  console.log(JSON.stringify(result.values, null, 2));
  
  console.log('\nApplication Summary:');
  console.log(`- App: ${result.values.APP_NAME} v${result.values.APP_VERSION}`);
  console.log(`- Database pool size: ${result.values.DB_POOL_SIZE}`);
  console.log(`- Rate limit: ${result.values.RATE_LIMIT_MAX} requests per ${result.values.RATE_LIMIT_WINDOW/1000}s`);
  console.log(`- Log level: ${result.values.LOG_LEVEL}`);
  console.log(`- Features enabled:`, Object.keys(result.values.FEATURES).filter(k => result.values.FEATURES[k]));
}
