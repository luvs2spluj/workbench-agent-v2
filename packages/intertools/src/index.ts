import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import pino from 'pino'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { interToolsMessageSchema } from '@langchain-flow/utils'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'production' 
    ? {} 
    : { transport: { target: 'pino-pretty' } }
  ),
})

const app = express()
const port = process.env.PORT || 3002

// Environment validation
const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  CORS_ORIGIN: z.string().default('*'),
})

let env: z.infer<typeof envSchema>
try {
  env = envSchema.parse(process.env)
} catch (error) {
  logger.error('❌ Invalid environment variables:', error)
  process.exit(1)
}

// Initialize Supabase
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for embedded usage
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for InterTools as it's used by many pages
  message: 'Too many requests, please try again later.',
})
app.use('/api', limiter)

// CORS configuration - more permissive for InterTools
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  credentials: false, // No credentials needed for InterTools
}))

// General middleware
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use(pinoHttp({ logger }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'intertools',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Universal Click-to-Chat JavaScript snippet
app.get('/chat.js', (req, res) => {
  const { projectId, theme = 'light' } = req.query
  
  if (!projectId) {
    return res.status(400).send('// Error: projectId parameter is required')
  }

  const chatScript = `
(function() {
  'use strict';
  
  const INTERTOOLS_URL = '${process.env.INTERTOOLS_URL || 'http://localhost:3002'}';
  const PROJECT_ID = '${projectId}';
  const THEME = '${theme}';
  
  // Create chat button
  function createChatButton() {
    const button = document.createElement('div');
    button.id = 'intertools-chat-button';
    button.innerHTML = '💬';
    button.style.cssText = \`
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: \${THEME === 'dark' ? '#374151' : '#3B82F6'};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transition: all 0.3s ease;
    \`;
    
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', handleChatClick);
    
    document.body.appendChild(button);
  }
  
  // Handle chat button click
  function handleChatClick() {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    
    // Get current page context
    const context = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      selectedText: selectedText,
      pageContent: getPageSnippet()
    };
    
    // Send to InterTools
    sendToInterTools(context);
    
    // Show feedback
    showFeedback(selectedText ? 'Selected text sent to chat!' : 'Page context sent to chat!');
  }
  
  // Get relevant page snippet
  function getPageSnippet() {
    // Try to get the main content area
    const main = document.querySelector('main') || 
                 document.querySelector('[role="main"]') || 
                 document.querySelector('.main-content') ||
                 document.querySelector('#main') ||
                 document.body;
    
    if (!main) return '';
    
    // Get text content, limited to 1000 characters
    const text = main.textContent || main.innerText || '';
    return text.substring(0, 1000).trim();
  }
  
  // Send data to InterTools API
  async function sendToInterTools(context) {
    try {
      const response = await fetch(\`\${INTERTOOLS_URL}/api/messages\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          htmlSnippet: context.selectedText || context.pageContent,
          url: context.url,
          projectId: PROJECT_ID,
          metadata: {
            title: context.title,
            timestamp: context.timestamp,
            userAgent: context.userAgent,
            hasSelection: !!context.selectedText
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      
      const result = await response.json();
      console.log('InterTools: Message sent successfully', result);
    } catch (error) {
      console.error('InterTools: Failed to send message', error);
      showFeedback('Failed to send to chat. Please try again.', 'error');
    }
  }
  
  // Show user feedback
  function showFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.style.cssText = \`
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: \${type === 'error' ? '#EF4444' : '#10B981'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10001;
      max-width: 250px;
      word-wrap: break-word;
    \`;
    feedback.textContent = message;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 3000);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatButton);
  } else {
    createChatButton();
  }
})();
`

  res.setHeader('Content-Type', 'application/javascript')
  res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
  res.send(chatScript)
})

// API endpoint to receive messages
app.post('/api/messages', async (req, res) => {
  try {
    const validatedData = interToolsMessageSchema.parse(req.body)
    
    // Insert log entry into Supabase
    const { data, error } = await supabase
      .from('logs')
      .insert({
        project_id: validatedData.projectId,
        level: 'info',
        message: \`InterTools message: \${validatedData.htmlSnippet.substring(0, 200)}\${validatedData.htmlSnippet.length > 200 ? '...' : ''}\`,
        metadata: {
          url: validatedData.url,
          source: 'intertools',
          fullContent: validatedData.htmlSnippet,
          ...validatedData.metadata
        },
        source: 'intertools',
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to insert log:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to save message'
      })
    }

    logger.info('InterTools message saved:', { 
      id: data.id, 
      projectId: validatedData.projectId,
      url: validatedData.url 
    })

    res.json({
      success: true,
      data: {
        id: data.id,
        message: 'Message saved successfully'
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      })
    }

    logger.error('Error in POST /api/messages:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get recent messages for a project (optional endpoint for debugging)
app.get('/api/messages/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params
    const limit = parseInt(req.query.limit as string) || 50

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('project_id', projectId)
      .eq('source', 'intertools')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: data.map(log => ({
        id: log.id,
        message: log.message,
        metadata: log.metadata,
        timestamp: log.timestamp,
        createdAt: log.created_at
      }))
    })
  } catch (error) {
    logger.error('Error in GET /api/messages/:projectId:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error)
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not found' 
  })
})

// Start server
app.listen(port, () => {
  logger.info(\`InterTools server running on port \${port}\`)
})

export default app
