import { Project, Run, Log, GraphNode, GraphEdge, Cost, CreateProjectSchema, CreateRunSchema, ApiResponse } from '@langchain-flow/utils'
import { supabase } from './supabase'

// Projects API
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.owner_id,
    githubRepo: project.github_repo,
    status: project.status,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  }))
}

export async function createProject(data: CreateProjectSchema): Promise<Project> {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: data.name,
      description: data.description,
      github_repo: data.githubRepo,
      owner_id: '550e8400-e29b-41d4-a716-446655440000', // TODO: Get from auth context
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.owner_id,
    githubRepo: project.github_repo,
    status: project.status,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  }
}

// Runs API
export async function createRun(data: CreateRunSchema): Promise<Run> {
  const response = await fetch('/api/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Run> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to create run')
  }

  return {
    ...result.data,
    createdAt: new Date(result.data.createdAt),
    updatedAt: new Date(result.data.createdAt),
    startedAt: result.data.startedAt ? new Date(result.data.startedAt) : undefined,
    completedAt: result.data.completedAt ? new Date(result.data.completedAt) : undefined,
  }
}

export async function getRun(runId: string): Promise<Run> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    status: data.status,
    triggerType: data.trigger_type,
    config: data.config,
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

// Logs API
export async function getRunLogs(runId: string): Promise<Log[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('run_id', runId)
    .order('timestamp', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(log => ({
    id: log.id,
    runId: log.run_id,
    projectId: log.project_id,
    level: log.level,
    message: log.message,
    metadata: log.metadata,
    source: log.source,
    timestamp: new Date(log.timestamp),
    createdAt: new Date(log.created_at),
  }))
}

// Graph API
export async function getRunGraph(runId: string): Promise<{ nodes: GraphNode[], edges: GraphEdge[] }> {
  const [nodesResponse, edgesResponse] = await Promise.all([
    supabase
      .from('graph_nodes')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true }),
    supabase
      .from('graph_edges')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true })
  ])

  if (nodesResponse.error) {
    throw new Error(nodesResponse.error.message)
  }

  if (edgesResponse.error) {
    throw new Error(edgesResponse.error.message)
  }

  const nodes = nodesResponse.data.map(node => ({
    id: node.id,
    runId: node.run_id,
    nodeId: node.node_id,
    label: node.label,
    type: node.type,
    status: node.status,
    positionX: node.position_x,
    positionY: node.position_y,
    metadata: node.metadata,
    createdAt: new Date(node.created_at),
    updatedAt: new Date(node.updated_at),
  }))

  const edges = edgesResponse.data.map(edge => ({
    id: edge.id,
    runId: edge.run_id,
    sourceNodeId: edge.source_node_id,
    targetNodeId: edge.target_node_id,
    label: edge.label,
    type: edge.type,
    metadata: edge.metadata,
    createdAt: new Date(edge.created_at),
  }))

  return { nodes, edges }
}

// Costs API
export async function getRunCosts(runId: string): Promise<Cost[]> {
  const { data, error } = await supabase
    .from('costs')
    .select('*')
    .eq('run_id', runId)
    .order('timestamp', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(cost => ({
    id: cost.id,
    runId: cost.run_id,
    projectId: cost.project_id,
    service: cost.service,
    operation: cost.operation,
    model: cost.model,
    tokensInput: cost.tokens_input,
    tokensOutput: cost.tokens_output,
    costUsd: parseFloat(cost.cost_usd),
    metadata: cost.metadata,
    timestamp: new Date(cost.timestamp),
    createdAt: new Date(cost.created_at),
  }))
}
