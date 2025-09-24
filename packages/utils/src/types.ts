// User types
export interface User {
  id: string
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  githubRepo?: string
  status: 'active' | 'archived' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

// Integration types
export interface Integration {
  id: string
  projectId: string
  type: 'github' | 'vercel' | 'openai' | 'anthropic' | 'custom'
  name: string
  config: Record<string, any>
  credentials: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  createdAt: Date
  updatedAt: Date
}

// Run types
export interface Run {
  id: string
  projectId: string
  name: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  triggerType: 'manual' | 'webhook' | 'scheduled'
  config: Record<string, any>
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Log types
export interface Log {
  id: string
  runId?: string
  projectId: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  metadata: Record<string, any>
  source: string
  timestamp: Date
  createdAt: Date
}

// Graph types
export interface GraphNode {
  id: string
  runId: string
  nodeId: string
  label: string
  type: 'tool' | 'llm' | 'decision' | 'data'
  status: 'pending' | 'running' | 'completed' | 'failed'
  positionX?: number
  positionY?: number
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface GraphEdge {
  id: string
  runId: string
  sourceNodeId: string
  targetNodeId: string
  label?: string
  type: string
  metadata: Record<string, any>
  createdAt: Date
}

// Cost types
export interface Cost {
  id: string
  runId?: string
  projectId: string
  service: string
  operation: string
  model?: string
  tokensInput: number
  tokensOutput: number
  costUsd: number
  metadata: Record<string, any>
  timestamp: Date
  createdAt: Date
}

// Artifact types
export interface Artifact {
  id: string
  runId: string
  projectId: string
  name: string
  type: 'html' | 'json' | 'image' | 'code' | 'text'
  contentType: string
  sizeBytes: number
  storagePath: string
  metadata: Record<string, any>
  createdAt: Date
}

// Embedding types
export interface Embedding {
  id: string
  projectId: string
  contentId?: string
  contentType: string
  textContent: string
  embedding: number[]
  metadata: Record<string, any>
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface JWTPayload {
  userId: string
  username: string
  iat: number
  exp: number
}

// LangChain types
export interface LangChainTool {
  name: string
  description: string
  schema: Record<string, any>
}

export interface LangChainMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  metadata?: Record<string, any>
}
