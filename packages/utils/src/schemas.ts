import { z } from 'zod'

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
})

// Project schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  ownerId: z.string().uuid(),
  githubRepo: z.string().max(255).optional(),
  status: z.enum(['active', 'archived', 'deleted']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  githubRepo: z.string().max(255).optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  githubRepo: z.string().max(255).optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
})

// Integration schemas
export const integrationSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  type: z.enum(['github', 'vercel', 'openai', 'anthropic', 'custom']),
  name: z.string().min(1).max(255),
  config: z.record(z.any()),
  credentials: z.record(z.any()),
  status: z.enum(['active', 'inactive', 'error']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createIntegrationSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(['github', 'vercel', 'openai', 'anthropic', 'custom']),
  name: z.string().min(1).max(255),
  config: z.record(z.any()),
  credentials: z.record(z.any()),
})

// Run schemas
export const runSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
  triggerType: z.enum(['manual', 'webhook', 'scheduled']),
  config: z.record(z.any()),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createRunSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  triggerType: z.enum(['manual', 'webhook', 'scheduled']),
  config: z.record(z.any()).default({}),
})

// Log schemas
export const logSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string().min(1),
  metadata: z.record(z.any()),
  source: z.string().min(1),
  timestamp: z.date(),
  createdAt: z.date(),
})

export const createLogSchema = z.object({
  runId: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  message: z.string().min(1),
  metadata: z.record(z.any()).default({}),
  source: z.string().min(1),
})

// Graph schemas
export const graphNodeSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  nodeId: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['tool', 'llm', 'decision', 'data']),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createGraphNodeSchema = z.object({
  runId: z.string().uuid(),
  nodeId: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['tool', 'llm', 'decision', 'data']),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  metadata: z.record(z.any()).default({}),
})

export const graphEdgeSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  label: z.string().optional(),
  type: z.string().default('default'),
  metadata: z.record(z.any()),
  createdAt: z.date(),
})

export const createGraphEdgeSchema = z.object({
  runId: z.string().uuid(),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  label: z.string().optional(),
  type: z.string().default('default'),
  metadata: z.record(z.any()).default({}),
})

// Cost schemas
export const costSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  service: z.string().min(1),
  operation: z.string().min(1),
  model: z.string().optional(),
  tokensInput: z.number().int().min(0),
  tokensOutput: z.number().int().min(0),
  costUsd: z.number().min(0),
  metadata: z.record(z.any()),
  timestamp: z.date(),
  createdAt: z.date(),
})

export const createCostSchema = z.object({
  runId: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  service: z.string().min(1),
  operation: z.string().min(1),
  model: z.string().optional(),
  tokensInput: z.number().int().min(0).default(0),
  tokensOutput: z.number().int().min(0).default(0),
  costUsd: z.number().min(0),
  metadata: z.record(z.any()).default({}),
})

// Artifact schemas
export const artifactSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['html', 'json', 'image', 'code', 'text']),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().min(0),
  storagePath: z.string().min(1),
  metadata: z.record(z.any()),
  createdAt: z.date(),
})

export const createArtifactSchema = z.object({
  runId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['html', 'json', 'image', 'code', 'text']),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().min(0),
  storagePath: z.string().min(1),
  metadata: z.record(z.any()).default({}),
})

// Common query schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// InterTools schemas
export const interToolsMessageSchema = z.object({
  htmlSnippet: z.string().min(1),
  url: z.string().url(),
  projectId: z.string().uuid(),
  metadata: z.record(z.any()).default({}),
})
