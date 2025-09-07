const envGuardian = require('../index');

// Basic usage example
console.log('🔧 Basic Configuration Example\n');

const config = envGuardian({
  // Server settings
  PORT: { type: 'number', default: 3000 },
  HOST: { type: 'string', default: 'localhost' },
  
  // Environment
  NODE_ENV: { 
    type: 'enum', 
    values: ['development', 'staging', 'production'], 
    default: 'development' 
  },
  
  // Security
  JWT_SECRET: { type: 'string', minLength: 16, default: 'default-secret-key' },
  
  // Features
  ENABLE_CORS: { type: 'boolean', default: false },
  
  // External services
  API_KEYS: { type: 'array', separator: ',', default: 'key1,key2,key3' },
});

console.log('Configuration loaded successfully:');
console.log(JSON.stringify(config, null, 2));

console.log('\nConfiguration summary:');
console.log(`- Server will run on ${config.HOST}:${config.PORT}`);
console.log(`- Environment: ${config.NODE_ENV}`);
console.log(`- CORS enabled: ${config.ENABLE_CORS}`);
console.log(`- JWT secret length: ${config.JWT_SECRET.length} characters`);
console.log(`- API keys loaded: ${config.API_KEYS.length}`);
