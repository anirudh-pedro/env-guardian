# 🛡️ env-guardian-js

A lightweight Node.js package to validate and manage environment variables with type safety.

[![npm version](https://badge.fury.io/js/env-guardian-js.svg)](https://badge.fury.io/js/env-guardian-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔍 **Type validation** - Validate environment variables as strings, numbers, booleans, arrays, URLs, emails, and enums
- 🚨 **Required field validation** - Ensure critical environment variables are present
- 🎯 **Default values** - Set fallback values for optional variables
- 📏 **Constraints** - Set min/max values, length limits, and custom patterns
- 🎨 **Custom validators** - Create your own validation functions
- 🔧 **TypeScript support** - Full TypeScript definitions included
- 🎭 **Flexible modes** - Strict mode for development, permissive mode for production
- 📦 **Zero dependencies** - Only uses dotenv for loading .env files

## 📦 Installation

```bash
npm install env-guardian-js
```

## 🚀 Quick Start

```javascript
const envGuardian = require("env-guardian-js");

// Define your environment schema
const config = envGuardian({
  PORT: { type: "number", default: 3000 },
  NODE_ENV: {
    type: "enum",
    values: ["development", "staging", "production"],
    required: true,
  },
  DATABASE_URL: { type: "url", required: true },
  API_KEYS: { type: "array", separator: "," },
  DEBUG: { type: "boolean", default: false },
});

console.log("Configuration loaded:", config);
// Output: { PORT: 3000, NODE_ENV: 'production', DATABASE_URL: 'postgres://...', API_KEYS: ['key1', 'key2'], DEBUG: false }
```

## 📖 API Reference

### Basic Usage

```javascript
const envGuardian = require("env-guardian-js");

// Simple validation
const config = envGuardian({
  API_KEY: "string", // Simple string type
  PORT: { type: "number", default: 3000 }, // Object configuration
});
```

### Supported Types

#### String

```javascript
{
  USERNAME: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/  // Only alphanumeric and underscore
  }
}
```

#### Number

```javascript
{
  PORT: {
    type: 'number',
    min: 1000,
    max: 65535,
    integer: true  // Must be an integer
  }
}
```

#### Boolean

```javascript
{
  DEBUG: {
    type: 'boolean',
    default: false
  }
}
// Accepts: 'true', 'false', '1', '0', 'yes', 'no' (case-insensitive)
```

#### Array

```javascript
{
  ALLOWED_ORIGINS: {
    type: 'array',
    separator: ',',  // Default separator
    minLength: 1,
    maxLength: 10
  }
}
// Environment: ALLOWED_ORIGINS=http://localhost:3000,https://example.com
// Result: ['http://localhost:3000', 'https://example.com']
```

#### URL

```javascript
{
  DATABASE_URL: {
    type: 'url',
    required: true,
    protocols: ['postgres', 'mysql']  // Only allow specific protocols
  }
}
```

#### Email

```javascript
{
  ADMIN_EMAIL: {
    type: 'email',
    required: true
  }
}
```

#### Enum

```javascript
{
  LOG_LEVEL: {
    type: 'enum',
    values: ['error', 'warn', 'info', 'debug'],
    default: 'info'
  }
}
```

#### Custom Validation

```javascript
{
  API_TOKEN: {
    type: (value, key) => {
      if (!/^[A-Za-z0-9]{32}$/.test(value)) {
        throw new Error(`${key} must be a 32-character alphanumeric token`);
      }
      return value;
    },
    required: true
  }
}
```

### Advanced Usage

#### Using the EnvGuardian Class

```javascript
const { EnvGuardian } = require("env-guardian-js");

const guardian = new EnvGuardian({
  loadDotenv: true, // Load .env file (default: true)
  dotenvPath: ".env", // Path to .env file (default: '.env')
  strict: false, // Strict validation mode (default: false)
});

const result = guardian.validate({
  PORT: { type: "number", required: true },
  INVALID_VAR: { type: "number" }, // This will fail but won't throw in non-strict mode
});

console.log(result.values); // { PORT: 3000, INVALID_VAR: undefined }
console.log(result.isValid); // false
console.log(result.errors); // [EnvGuardianError: ...]
```

#### Error Handling

```javascript
const { EnvGuardianError } = require("env-guardian-js");

try {
  const config = envGuardian({
    PORT: { type: "number", required: true },
  });
} catch (error) {
  if (error instanceof EnvGuardianError) {
    console.log("Variable:", error.variable);
    console.log("Message:", error.message);
  }
}
```

### Configuration Options

| Option       | Type    | Default  | Description                                |
| ------------ | ------- | -------- | ------------------------------------------ |
| `loadDotenv` | boolean | `true`   | Whether to load .env file                  |
| `dotenvPath` | string  | `'.env'` | Path to the .env file                      |
| `strict`     | boolean | `false`  | Whether to throw on first validation error |

### Validation Configuration

| Property    | Type            | Applies To    | Description                          |
| ----------- | --------------- | ------------- | ------------------------------------ |
| `type`      | string/function | All           | Variable type or custom validator    |
| `required`  | boolean         | All           | Whether the variable is required     |
| `default`   | any             | All           | Default value if variable is missing |
| `minLength` | number          | string, array | Minimum length                       |
| `maxLength` | number          | string, array | Maximum length                       |
| `pattern`   | RegExp          | string        | Pattern to match                     |
| `min`       | number          | number        | Minimum value                        |
| `max`       | number          | number        | Maximum value                        |
| `integer`   | boolean         | number        | Must be an integer                   |
| `separator` | string          | array         | Array separator (default: ',')       |
| `protocols` | string[]        | url           | Allowed URL protocols                |
| `values`    | any[]           | enum          | Allowed enum values                  |

## 💡 Examples

### Complete Application Configuration

```javascript
const envGuardian = require("env-guardian-js");

const config = envGuardian({
  // Server configuration
  NODE_ENV: {
    type: "enum",
    values: ["development", "staging", "production"],
    default: "development",
  },
  PORT: {
    type: "number",
    min: 1000,
    max: 65535,
    default: 3000,
  },
  HOST: {
    type: "string",
    default: "0.0.0.0",
  },

  // Database configuration
  DATABASE_URL: {
    type: "url",
    required: true,
    protocols: ["postgres", "mysql"],
  },
  DB_POOL_SIZE: {
    type: "number",
    min: 1,
    max: 100,
    default: 10,
  },

  // Security
  JWT_SECRET: {
    type: "string",
    required: true,
    minLength: 32,
  },
  API_KEYS: {
    type: "array",
    separator: ",",
  },

  // External services
  REDIS_URL: {
    type: "url",
    protocols: ["redis"],
  },
  ADMIN_EMAIL: {
    type: "email",
    required: true,
  },

  // Feature flags
  ENABLE_LOGGING: {
    type: "boolean",
    default: true,
  },
  LOG_LEVEL: {
    type: "enum",
    values: ["error", "warn", "info", "debug"],
    default: "info",
  },
});

module.exports = config;
```

### Custom Validation Examples

```javascript
const config = envGuardian({
  // Validate semantic version
  APP_VERSION: {
    type: (value, key) => {
      if (!/^\d+\.\d+\.\d+$/.test(value)) {
        throw new Error(
          `${key} must be a valid semantic version (e.g., 1.0.0)`
        );
      }
      return value;
    },
    default: "1.0.0",
  },

  // Validate cron expression
  BACKUP_SCHEDULE: {
    type: (value, key) => {
      // Simple cron validation (5 parts)
      const parts = value.split(" ");
      if (parts.length !== 5) {
        throw new Error(`${key} must be a valid cron expression`);
      }
      return value;
    },
    default: "0 2 * * *", // 2 AM daily
  },

  // Validate JSON string
  FEATURE_CONFIG: {
    type: (value, key) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        throw new Error(`${key} must be valid JSON`);
      }
    },
    default: "{}",
  },
});
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The package includes comprehensive tests covering all validation types and edge cases.

## 📝 TypeScript Support

env-guardian includes full TypeScript definitions:

```typescript
import envGuardian, { EnvGuardian, ValidationConfig } from "env-guardian-js";

interface AppConfig {
  PORT: number;
  NODE_ENV: "development" | "staging" | "production";
  DATABASE_URL: string;
}

const config = envGuardian<AppConfig>({
  PORT: { type: "number", default: 3000 },
  NODE_ENV: {
    type: "enum",
    values: ["development", "staging", "production"],
    required: true,
  },
  DATABASE_URL: { type: "url", required: true },
});

// config is now typed as AppConfig
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the Node.js community
- Inspired by the need for better environment variable management
- Special thanks to all contributors

---

Made with ❤️ by [Anirudh](https://github.com/anirudh)
