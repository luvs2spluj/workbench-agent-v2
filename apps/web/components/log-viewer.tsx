'use client'

import { useEffect, useRef } from 'react'
import { Log } from '@langchain-flow/utils'
import { Badge } from '@langchain-flow/ui'

interface LogViewerProps {
  logs?: Log[]
  isLoading: boolean
  isLive: boolean
}

export function LogViewer({ logs, isLoading, isLive }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)

  useEffect(() => {
    if (shouldAutoScroll.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  const handleScroll = () => {
    if (!containerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    shouldAutoScroll.current = isAtBottom
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'bg-gray-100 text-gray-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  if (isLoading && (!logs || logs.length === 0)) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isLive && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Live</span>
          </div>
          <span className="text-sm text-gray-500">
            Auto-scrolling to latest logs
          </span>
        </div>
      )}

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-96 overflow-auto bg-gray-900 rounded-lg p-4 font-mono text-sm"
      >
        {!logs || logs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <p>No logs yet.</p>
            <p className="text-xs mt-1">Logs will appear here as the workflow executes.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-1">
                <span className="text-gray-500 text-xs min-w-[80px]">
                  {formatTimestamp(log.timestamp)}
                </span>
                <Badge 
                  className={`${getLevelColor(log.level)} text-xs min-w-[50px] justify-center`}
                >
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-gray-400 text-xs min-w-[80px]">
                  {log.source}
                </span>
                <span className="text-gray-100 flex-1 break-words">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {logs && logs.length > 0 && (
        <div className="text-xs text-gray-500 text-right">
          {logs.length} log entries
        </div>
      )}
    </div>
  )
}
