export interface ValidationConfig {
  type?: 'string' | 'number' | 'boolean' | 'array' | 'url' | 'email' | 'enum' | Function;
  required?: boolean;
  default?: any;
  
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  
  min?: number;
  max?: number;
  integer?: boolean;
  
  separator?: string;
  
  protocols?: string[];
  
  values?: any[];
}

export interface EnvSchema {
  [key: string]: ValidationConfig | string;
}

export interface ValidationResult<T = any> {
  values: T;
  errors: EnvGuardianError[] | null;
  isValid: boolean;
}

export interface EnvGuardianOptions {
  loadDotenv?: boolean;
  dotenvPath?: string;
  strict?: boolean;
}

export class EnvGuardianError extends Error {
  variable: string;
  constructor(message: string, variable?: string);
}

export class EnvGuardian {
  constructor(options?: EnvGuardianOptions);
  validate<T = any>(schema: EnvSchema): ValidationResult<T>;
}

declare function envGuardian<T = any>(schema: EnvSchema, options?: EnvGuardianOptions): T;

declare namespace envGuardian {
  export const EnvGuardian: typeof import('./index').EnvGuardian;
  export const EnvGuardianError: typeof import('./index').EnvGuardianError;
}

export = envGuardian;
