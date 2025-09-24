'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@langchain-flow/ui'
import { getRun, getRunLogs, getRunGraph, getRunCosts } from '@/lib/api'
import { GraphViewer } from '@/components/graph-viewer'
import { LogViewer } from '@/components/log-viewer'
import { CostCard } from '@/components/cost-card'
import { ArrowLeft, Play, Square, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function RunPage() {
  const params = useParams()
  const runId = params.id as string

  const { data: run, isLoading: runLoading } = useQuery({
    queryKey: ['run', runId],
    queryFn: () => getRun(runId),
    refetchInterval: (data) => {
      // Refetch every 2 seconds if run is active
      return data?.status === 'running' || data?.status === 'queued' ? 2000 : false
    },
  })

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['run-logs', runId],
    queryFn: () => getRunLogs(runId),
    refetchInterval: (data) => {
      // Refetch every 2 seconds if run is active
      return run?.status === 'running' || run?.status === 'queued' ? 2000 : false
    },
  })

  const { data: graph, isLoading: graphLoading } = useQuery({
    queryKey: ['run-graph', runId],
    queryFn: () => getRunGraph(runId),
    refetchInterval: (data) => {
      // Refetch every 2 seconds if run is active
      return run?.status === 'running' || run?.status === 'queued' ? 2000 : false
    },
  })

  const { data: costs, isLoading: costsLoading } = useQuery({
    queryKey: ['run-costs', runId],
    queryFn: () => getRunCosts(runId),
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />
      case 'running':
        return <Play className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'cancelled':
        return <Square className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-100 text-yellow-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (runLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Run not found</h1>
          <p className="text-gray-600 mb-4">The requested run could not be found.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{run.name}</h1>
                <p className="text-sm text-gray-600">Run ID: {run.id}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(run.status)} flex items-center gap-2`}>
              {getStatusIcon(run.status)}
              {run.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Run Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {run.startedAt 
                    ? new Date(run.startedAt).toLocaleString()
                    : 'Not started'
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {run.startedAt && run.completedAt
                    ? `${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s`
                    : run.startedAt
                    ? `${Math.round((new Date().getTime() - new Date(run.startedAt).getTime()) / 1000)}s`
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>

            <CostCard costs={costs} isLoading={costsLoading} />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="graph" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="graph">Workflow Graph</TabsTrigger>
              <TabsTrigger value="logs">Live Logs</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="graph" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Visualization</CardTitle>
                  <CardDescription>
                    Interactive graph showing the flow of your workflow execution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GraphViewer 
                    graph={graph} 
                    isLoading={graphLoading}
                    runStatus={run.status}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Live Logs</CardTitle>
                  <CardDescription>
                    Real-time log output from your workflow execution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LogViewer 
                    logs={logs} 
                    isLoading={logsLoading}
                    isLive={run.status === 'running' || run.status === 'queued'}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="artifacts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Artifacts</CardTitle>
                  <CardDescription>
                    Files and outputs generated during workflow execution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>No artifacts generated yet.</p>
                    <p className="text-sm">Artifacts will appear here as they are created during the workflow.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
