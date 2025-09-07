const dotenv = require("dotenv");

class EnvGuardianError extends Error {
  constructor(message, variable) {
    super(message);
    this.name = "EnvGuardianError";
    this.variable = variable;
  }
}

class EnvGuardian {
  constructor(options = {}) {
    this.options = {
      loadDotenv: true,
      dotenvPath: '.env',
      strict: false,
      ...options
    };

    if (this.options.loadDotenv) {
      dotenv.config({ path: this.options.dotenvPath });
    }
  }

  // Type validation functions
  validateString(value, key, config = {}) {
    if (typeof value !== 'string') {
      throw new EnvGuardianError(`Invalid type for ${key}. Expected string, got ${typeof value}`, key);
    }
    
    if (config.minLength && value.length < config.minLength) {
      throw new EnvGuardianError(`${key} must be at least ${config.minLength} characters long`, key);
    }
    
    if (config.maxLength && value.length > config.maxLength) {
      throw new EnvGuardianError(`${key} must be no more than ${config.maxLength} characters long`, key);
    }
    
    if (config.pattern && !config.pattern.test(value)) {
      throw new EnvGuardianError(`${key} does not match required pattern`, key);
    }
    
    return value;
  }

  validateNumber(value, key, config = {}) {
    const num = Number(value);
    if (isNaN(num)) {
      throw new EnvGuardianError(`Invalid type for ${key}. Expected number, got "${value}"`, key);
    }
    
    if (config.min !== undefined && num < config.min) {
      throw new EnvGuardianError(`${key} must be at least ${config.min}`, key);
    }
    
    if (config.max !== undefined && num > config.max) {
      throw new EnvGuardianError(`${key} must be no more than ${config.max}`, key);
    }
    
    if (config.integer && !Number.isInteger(num)) {
      throw new EnvGuardianError(`${key} must be an integer`, key);
    }
    
    return num;
  }

  validateBoolean(value, key) {
    const lowerValue = value.toLowerCase();
    if (lowerValue === "true" || lowerValue === "1" || lowerValue === "yes") return true;
    if (lowerValue === "false" || lowerValue === "0" || lowerValue === "no") return false;
    throw new EnvGuardianError(`Invalid type for ${key}. Expected boolean, got "${value}"`, key);
  }

  validateArray(value, key, config = {}) {
    const separator = config.separator || ',';
    const items = value.split(separator).map(item => item.trim());
    
    if (config.minLength && items.length < config.minLength) {
      throw new EnvGuardianError(`${key} must have at least ${config.minLength} items`, key);
    }
    
    if (config.maxLength && items.length > config.maxLength) {
      throw new EnvGuardianError(`${key} must have no more than ${config.maxLength} items`, key);
    }
    
    return items;
  }

  validateUrl(value, key, config = {}) {
    try {
      const url = new URL(value);
      
      if (config.protocols && !config.protocols.includes(url.protocol.slice(0, -1))) {
        throw new EnvGuardianError(`${key} must use one of these protocols: ${config.protocols.join(', ')}`, key);
      }
      
      return value;
    } catch (error) {
      throw new EnvGuardianError(`Invalid URL for ${key}: "${value}"`, key);
    }
  }

  validateEmail(value, key) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      throw new EnvGuardianError(`Invalid email format for ${key}: "${value}"`, key);
    }
    return value;
  }

  validateEnum(value, key, config = {}) {
    if (!config.values || !Array.isArray(config.values)) {
      throw new Error(`Enum validation requires 'values' array for ${key}`);
    }
    
    if (!config.values.includes(value)) {
      throw new EnvGuardianError(`${key} must be one of: ${config.values.join(', ')}. Got "${value}"`, key);
    }
    
    return value;
  }

  parseValue(value, type, key, config = {}) {
    switch (type) {
      case 'string':
        return this.validateString(value, key, config);
      case 'number':
        return this.validateNumber(value, key, config);
      case 'boolean':
        return this.validateBoolean(value, key);
      case 'array':
        return this.validateArray(value, key, config);
      case 'url':
        return this.validateUrl(value, key, config);
      case 'email':
        return this.validateEmail(value, key);
      case 'enum':
        return this.validateEnum(value, key, config);
      default:
        if (typeof type === 'function') {
          return type(value, key, config);
        }
        return value;
    }
  }

  validate(schema) {
    const result = {};
    const errors = [];

    for (const [key, definition] of Object.entries(schema)) {
      try {
        const config = typeof definition === 'object' ? definition : { type: definition };
        const { type = 'string', required = false, default: defaultValue } = config;
        
        let value = process.env[key];

        // Handle missing values
        if (value === undefined || value === '') {
          if (required) {
            errors.push(new EnvGuardianError(`Missing required environment variable: ${key}`, key));
            continue;
          } else if (defaultValue !== undefined) {
            value = String(defaultValue);
          } else {
            result[key] = undefined;
            continue;
          }
        }

        // Parse and validate the value
        result[key] = this.parseValue(value, type, key, config);
        
      } catch (error) {
        if (this.options.strict) {
          throw error;
        }
        errors.push(error);
      }
    }

    if (errors.length > 0 && this.options.strict !== false) {
      const errorMessage = errors.map(e => e.message).join('\n');
      throw new EnvGuardianError(`Environment validation failed:\n${errorMessage}`);
    }

    return {
      values: result,
      errors: errors.length > 0 ? errors : null,
      isValid: errors.length === 0
    };
  }
}

// Convenience function for backward compatibility and simple usage
function envGuardian(schema, options = {}) {
  const guardian = new EnvGuardian(options);
  const result = guardian.validate(schema);
  
  if (!result.isValid) {
    throw result.errors[0] || new EnvGuardianError('Validation failed');
  }
  
  return result.values;
}

// Export both the class and the function
envGuardian.EnvGuardian = EnvGuardian;
envGuardian.EnvGuardianError = EnvGuardianError;

module.exports = envGuardian;
