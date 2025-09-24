import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import pino from 'pino'

import { authRouter } from './routes/auth'
import { projectsRouter } from './routes/projects'
import { integrationsRouter } from './routes/integrations'
import { logsRouter } from './routes/logs'
import { runsRouter } from './routes/runs'
import { errorHandler } from './middleware/error-handler'
import { validateEnv } from './config/env'
import { startWorker } from './workers/langchain-worker'

// Validate environment variables
validateEnv()

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'production' 
    ? {} 
    : { transport: { target: 'pino-pretty' } }
  ),
})

const app = express()
const port = process.env.PORT || 3001

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://*.supabase.co"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api', limiter)

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))

// General middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use(pinoHttp({ logger }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API routes
app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/integrations', integrationsRouter)
app.use('/api/logs', logsRouter)
app.use('/api/runs', runsRouter)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`)
  
  // Start the LangChain worker
  startWorker().catch((error) => {
    logger.error('Failed to start worker:', error)
  })
})

export default app
