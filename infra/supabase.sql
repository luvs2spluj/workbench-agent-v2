-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- 'github', 'vercel', 'openai', etc.
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  credentials JSONB NOT NULL DEFAULT '{}', -- encrypted sensitive data
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Runs table (workflow executions)
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
  trigger_type VARCHAR(100), -- 'manual', 'webhook', 'scheduled'
  config JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  level VARCHAR(20) DEFAULT 'info', -- 'debug', 'info', 'warn', 'error'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  source VARCHAR(100), -- 'server', 'intertools', 'langchain', etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Graph nodes table (for visualization)
CREATE TABLE graph_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  node_id VARCHAR(255) NOT NULL, -- unique within a run
  label VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'tool', 'llm', 'decision', 'data'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  position_x FLOAT,
  position_y FLOAT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(run_id, node_id)
);

-- Graph edges table (for visualization)
CREATE TABLE graph_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  source_node_id VARCHAR(255) NOT NULL,
  target_node_id VARCHAR(255) NOT NULL,
  label VARCHAR(255),
  type VARCHAR(100) DEFAULT 'default',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (run_id, source_node_id) REFERENCES graph_nodes(run_id, node_id) ON DELETE CASCADE,
  FOREIGN KEY (run_id, target_node_id) REFERENCES graph_nodes(run_id, node_id) ON DELETE CASCADE
);

-- Costs table (for tracking LLM and API usage)
CREATE TABLE costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  service VARCHAR(100) NOT NULL, -- 'openai', 'anthropic', 'vercel', etc.
  operation VARCHAR(100) NOT NULL, -- 'completion', 'embedding', 'deployment'
  model VARCHAR(100), -- 'gpt-4', 'claude-3-sonnet', etc.
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artifacts table (for storing generated files/outputs)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'html', 'json', 'image', 'code', etc.
  content_type VARCHAR(100), -- MIME type
  size_bytes INTEGER,
  storage_path VARCHAR(500), -- path in storage system
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embeddings table (for vector search)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_id UUID, -- reference to logs, artifacts, etc.
  content_type VARCHAR(100) NOT NULL, -- 'log', 'artifact', 'code', etc.
  text_content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_integrations_project_id ON integrations(project_id);
CREATE INDEX idx_runs_project_id ON runs(project_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_logs_run_id ON logs(run_id);
CREATE INDEX idx_logs_project_id ON logs(project_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_graph_nodes_run_id ON graph_nodes(run_id);
CREATE INDEX idx_graph_edges_run_id ON graph_edges(run_id);
CREATE INDEX idx_costs_run_id ON costs(run_id);
CREATE INDEX idx_costs_project_id ON costs(project_id);
CREATE INDEX idx_costs_timestamp ON costs(timestamp);
CREATE INDEX idx_artifacts_run_id ON artifacts(run_id);
CREATE INDEX idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX idx_embeddings_project_id ON embeddings(project_id);
CREATE INDEX idx_embeddings_content_type ON embeddings(content_type);

-- Vector similarity search index
CREATE INDEX idx_embeddings_vector ON embeddings USING hnsw (embedding vector_cosine_ops);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on auth requirements)
CREATE POLICY "Users can view their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view their own projects" ON projects
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view integrations for their projects" ON integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = integrations.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view runs for their projects" ON runs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = runs.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view logs for their projects" ON logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = logs.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view graph nodes for their runs" ON graph_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM runs 
      JOIN projects ON projects.id = runs.project_id
      WHERE runs.id = graph_nodes.run_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view graph edges for their runs" ON graph_edges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM runs 
      JOIN projects ON projects.id = runs.project_id
      WHERE runs.id = graph_edges.run_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view costs for their projects" ON costs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = costs.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view artifacts for their projects" ON artifacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = artifacts.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view embeddings for their projects" ON embeddings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = embeddings.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_runs_updated_at BEFORE UPDATE ON runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graph_nodes_updated_at BEFORE UPDATE ON graph_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development (optional)
INSERT INTO users (id, username, email, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@langchainflow.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewVyWtUK/VdLhO3e');

INSERT INTO projects (id, name, description, owner_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sample Project', 'A sample project for testing', '550e8400-e29b-41d4-a716-446655440000');
