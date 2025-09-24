'use client'

import { useEffect, useRef } from 'react'
import { GraphNode, GraphEdge } from '@langchain-flow/utils'

interface GraphViewerProps {
  graph?: { nodes: GraphNode[], edges: GraphEdge[] }
  isLoading: boolean
  runStatus: string
}

export function GraphViewer({ graph, isLoading, runStatus }: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!graph || !containerRef.current) return

    // For now, we'll create a simple Mermaid diagram
    // In a full implementation, you'd use Cytoscape.js or similar
    const mermaidCode = generateMermaidDiagram(graph)
    
    // Create a simple text representation for now
    const pre = document.createElement('pre')
    pre.className = 'bg-gray-100 p-4 rounded-lg text-sm overflow-auto'
    pre.textContent = mermaidCode

    // Clear previous content
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(pre)

    // Add a visual graph representation
    const graphContainer = document.createElement('div')
    graphContainer.className = 'mt-4 p-4 bg-white border rounded-lg'
    
    if (graph.nodes.length === 0) {
      graphContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <p>No workflow nodes yet.</p>
          <p class="text-sm">The graph will appear as the workflow executes.</p>
        </div>
      `
    } else {
      // Create a simple visual representation
      const nodeElements = graph.nodes.map(node => {
        const statusColor = getNodeStatusColor(node.status)
        return `
          <div class="inline-block m-2 p-3 border rounded-lg ${statusColor}">
            <div class="font-medium">${node.label}</div>
            <div class="text-xs text-gray-600">${node.type}</div>
            <div class="text-xs mt-1">
              <span class="px-2 py-1 rounded text-xs ${getStatusBadgeColor(node.status)}">
                ${node.status}
              </span>
            </div>
          </div>
        `
      }).join('')

      graphContainer.innerHTML = `
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Workflow Nodes</h4>
          <div class="flex flex-wrap">
            ${nodeElements}
          </div>
        </div>
      `
    }

    containerRef.current.appendChild(graphContainer)

  }, [graph])

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-96 overflow-auto">
      <div ref={containerRef} className="w-full h-full"></div>
    </div>
  )
}

function generateMermaidDiagram(graph: { nodes: GraphNode[], edges: GraphEdge[] }): string {
  let mermaid = 'graph TD\n'
  
  // Add nodes
  graph.nodes.forEach(node => {
    const shape = getNodeShape(node.type)
    mermaid += `  ${node.nodeId}${shape[0]}${node.label}${shape[1]}\n`
  })

  // Add edges
  graph.edges.forEach(edge => {
    mermaid += `  ${edge.sourceNodeId} --> ${edge.targetNodeId}\n`
  })

  return mermaid
}

function getNodeShape(type: string): [string, string] {
  switch (type) {
    case 'tool':
      return ['[', ']']
    case 'llm':
      return ['(', ')']
    case 'decision':
      return ['{', '}']
    case 'data':
      return ['[[', ']]']
    default:
      return ['[', ']']
  }
}

function getNodeStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 border-yellow-200'
    case 'running':
      return 'bg-blue-50 border-blue-200'
    case 'completed':
      return 'bg-green-50 border-green-200'
    case 'failed':
      return 'bg-red-50 border-red-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'running':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
