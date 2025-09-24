// API Constants
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me'
  },
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    GET: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`
  },
  RUNS: {
    LIST: '/api/runs',
    CREATE: '/api/runs',
    GET: (id: string) => `/api/runs/${id}`,
    LOGS: (id: string) => `/api/runs/${id}/logs`,
    GRAPH: (id: string) => `/api/runs/${id}/graph`,
    COSTS: (id: string) => `/api/runs/${id}/costs`
  },
  INTEGRATIONS: {
    LIST: '/api/integrations',
    CREATE: '/api/integrations',
    GET: (id: string) => `/api/integrations/${id}`,
    UPDATE: (id: string) => `/api/integrations/${id}`,
    DELETE: (id: string) => `/api/integrations/${id}`
  }
} as const

// Status Constants
export const RUN_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const

export const NODE_TYPES = {
  TOOL: 'tool',
  LLM: 'llm',
  DECISION: 'decision',
  DATA: 'data'
} as const

export const INTEGRATION_TYPES = {
  GITHUB: 'github',
  VERCEL: 'vercel',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  CUSTOM: 'custom'
} as const

// Default Values
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
} as const

export const DEFAULT_TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  LLM_REQUEST: 120000, // 2 minutes
  FILE_UPLOAD: 300000 // 5 minutes
} as const

// Validation Constants
export const VALIDATION_LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 100,
  PROJECT_NAME_MAX: 255,
  PROJECT_DESCRIPTION_MAX: 1000,
  LOG_MESSAGE_MAX: 10000
} as const
