# LangChain Flow

> **Full-stack dev tool to manage repos, visualize flows, integrate LLMs, and automate workflows.**

LangChain Flow is a comprehensive development platform that combines repository management, workflow visualization, LLM integration, and automation tools into a single, powerful application. Built as a modern monorepo with TypeScript, it provides developers with everything they need to streamline their development workflows.

## 🚀 Features

### Core Capabilities
- **GitHub Repository Integration** - Connect and manage your GitHub repositories
- **Visual Workflow Designer** - Interactive Mermaid/Cytoscape graphs for workflow visualization
- **LLM Pipeline Integration** - Built-in support for OpenAI, Anthropic, and other LLM providers
- **Real-time Logging** - Live log streaming and comprehensive audit trails
- **Cost Monitoring** - Track API usage and costs across all integrations
- **Universal Click-to-Chat** - InterTools microservice for embedding chat on any webpage

### Technical Highlights
- **Monorepo Architecture** - Turborepo + PNPM for efficient development
- **Type Safety** - Full TypeScript coverage with Zod validation
- **Modern UI** - Next.js 13+ with Tailwind CSS and shadcn/ui components
- **Scalable Backend** - Express.js with LangChain integration
- **Vector Database** - Supabase with pgvector for embeddings
- **Security First** - JWT authentication, rate limiting, CORS, CSP headers
- **Production Ready** - Docker containerization and Vercel deployment support

## 📋 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PNPM** 8+ (`npm install -g pnpm`)
- **Supabase Account** (for database)
- **OpenAI API Key** (for LLM features)

### 1. Clone and Install

```bash
git clone <repository-url>
cd langchain-flow
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, OPENAI_API_KEY
```

### 3. Database Setup

```bash
# Run the SQL schema in your Supabase project
# Copy contents of infra/supabase.sql to Supabase SQL editor and execute
```

### 4. Start Development

```bash
# Start all services in development mode
pnpm dev

# Services will be available at:
# - Web App: http://localhost:3000
# - API Server: http://localhost:3001
# - InterTools: http://localhost:3002
```

## 🏗️ Architecture

### Monorepo Structure

```
langchain-flow/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── server/              # Express.js API server + LangChain worker
├── packages/
│   ├── ui/                  # Shared React components (shadcn/ui)
│   ├── utils/               # Shared utilities, types, and schemas
│   └── intertools/          # Express microservice for click-to-chat
├── infra/
│   ├── supabase.sql         # Database schema and setup
│   ├── docker-compose.yml   # Local development with Docker
│   └── Dockerfile.*         # Container definitions
└── README.md
```

### Tech Stack

#### Frontend (`apps/web`)
- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query for server state, React Context for client state
- **Visualization**: Cytoscape.js for interactive graphs, Mermaid for diagrams
- **Type Safety**: TypeScript + Zod validation

#### Backend (`apps/server`)
- **Framework**: Express.js with TypeScript
- **LLM Integration**: LangChain with OpenAI/Anthropic support
- **Authentication**: JWT (RS256) with refresh tokens
- **Queue System**: BullMQ + Redis (optional)
- **Security**: Helmet, CORS, rate limiting, input validation

#### Database
- **Primary**: Supabase (PostgreSQL + Auth + Realtime)
- **Vector Search**: pgvector extension for embeddings
- **Caching**: Redis (optional, for queues and caching)

#### InterTools (`packages/intertools`)
- **Purpose**: Universal click-to-chat functionality
- **Deployment**: Standalone Express microservice
- **Integration**: JavaScript snippet for any webpage

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev                     # Start all services in dev mode
pnpm dev --filter=web        # Start only web app
pnpm dev --filter=server     # Start only API server

# Building
pnpm build                   # Build all packages and apps
pnpm build --filter=web      # Build only web app

# Testing & Quality
pnpm lint                    # Lint all packages
pnpm type-check              # TypeScript type checking
pnpm test                    # Run tests (when implemented)

# Cleanup
pnpm clean                   # Remove all build artifacts
```

### Docker Development

```bash
# Start all services with Docker
docker-compose -f infra/docker-compose.yml up

# Start specific services
docker-compose -f infra/docker-compose.yml up web server

# Development with hot reload
docker-compose -f infra/docker-compose.yml up --build
```

## 📊 Usage

### Creating Your First Project

1. **Start the application**: `pnpm dev`
2. **Open the web app**: http://localhost:3000
3. **Create a project**: Click "Create Project" and fill in the details
4. **Add integrations**: Configure GitHub, OpenAI, or other services
5. **Run workflows**: Click "Run" to execute your first workflow

### Using InterTools Click-to-Chat

1. **Get your project ID** from the web interface
2. **Embed the script** on any webpage:
   ```html
   <script src="http://localhost:3002/chat.js?projectId=YOUR_PROJECT_ID"></script>
   ```
3. **Click the chat button** to send page content to your LangChain Flow logs

### API Integration

The server exposes a full REST API for integration:

```typescript
// Example: Create a new run
const response = await fetch('/api/runs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: 'uuid',
    name: 'My Workflow Run',
    triggerType: 'manual',
    config: {}
  })
})
```

## 🔒 Security

### Authentication
- **JWT Tokens**: RS256 algorithm with short expiry (1h) + refresh tokens (7d)
- **Password Hashing**: bcrypt with 12 rounds
- **Session Management**: Stateless JWT with optional Redis storage

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable origins, credentials support
- **Input Validation**: Zod schemas for all endpoints
- **SQL Injection**: Parameterized queries via Supabase client

### Headers & CSP
- **Security Headers**: Helmet.js with strict CSP
- **HTTPS Enforcement**: Automatic redirect in production
- **XSS Protection**: Content Security Policy + input sanitization

## 🚢 Deployment

### Vercel (Recommended for Web App)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy web app
cd apps/web
vercel

# Set environment variables in Vercel dashboard
```

### Supabase (Database)

1. **Create project** at https://supabase.com
2. **Run SQL schema** from `infra/supabase.sql`
3. **Configure RLS policies** as needed
4. **Get connection details** for environment variables

### Docker Production

```bash
# Build production images
docker-compose -f infra/docker-compose.yml build

# Deploy with production environment
docker-compose -f infra/docker-compose.prod.yml up -d
```

### Environment Variables

Required for production:

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-super-secure-secret-32-chars-min

# LLM APIs
OPENAI_API_KEY=sk-your-openai-key

# Optional integrations
GITHUB_TOKEN=ghp_your-github-token
VERCEL_TOKEN=your-vercel-token
```

## 🧪 Testing

### Test Structure
```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Test Data
- Sample projects and runs are created via `infra/supabase.sql`
- Mock LLM responses for consistent testing
- Isolated test database for integration tests

## 🔄 Roadmap

### Immediate (MVP)
- [x] Monorepo setup with Turborepo
- [x] Next.js web application
- [x] Express API with LangChain integration
- [x] Supabase database with vector support
- [x] InterTools click-to-chat microservice
- [x] Docker containerization

### Short Term
- [ ] Advanced graph visualization (React Flow)
- [ ] Real-time updates via Supabase Realtime
- [ ] Agent Zero integration for sub-agent orchestration
- [ ] Stripe integration for payments
- [ ] Email notifications via SendGrid

### Long Term
- [ ] Multi-tenant organizations with RBAC
- [ ] Advanced analytics dashboard
- [ ] Workflow marketplace and templates
- [ ] Mobile app (React Native)
- [ ] Enterprise SSO integration

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `pnpm install`
4. **Start development**: `pnpm dev`
5. **Make changes and test**
6. **Submit pull request**

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for consistency
- **Prettier**: Code formatting
- **Conventional Commits**: For clear history

### Pull Request Process
1. Update documentation for any API changes
2. Add tests for new functionality
3. Ensure all tests pass: `pnpm test`
4. Update CHANGELOG.md
5. Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LangChain** - For the excellent LLM framework
- **Supabase** - For the fantastic backend-as-a-service
- **Vercel** - For seamless deployment and hosting
- **shadcn/ui** - For beautiful, accessible UI components
- **Turborepo** - For efficient monorepo management

---

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: Contact the maintainers for security issues

**Happy coding with LangChain Flow! 🚀**
