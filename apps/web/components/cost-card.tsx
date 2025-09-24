'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@langchain-flow/ui'
import { Cost } from '@langchain-flow/utils'
import { DollarSign, TrendingUp, Zap } from 'lucide-react'

interface CostCardProps {
  costs?: Cost[]
  isLoading: boolean
}

export function CostCard({ costs, isLoading }: CostCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalCost = costs?.reduce((sum, cost) => sum + cost.costUsd, 0) || 0
  const totalTokensInput = costs?.reduce((sum, cost) => sum + cost.tokensInput, 0) || 0
  const totalTokensOutput = costs?.reduce((sum, cost) => sum + cost.tokensOutput, 0) || 0
  const totalTokens = totalTokensInput + totalTokensOutput

  const formatCost = (cost: number) => {
    if (cost === 0) return '$0.00'
    if (cost < 0.01) return `$${cost.toFixed(4)}`
    return `$${cost.toFixed(2)}`
  }

  const formatTokens = (tokens: number) => {
    if (tokens === 0) return '0'
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
    return tokens.toString()
  }

  const getServiceBreakdown = () => {
    if (!costs || costs.length === 0) return []
    
    const breakdown = costs.reduce((acc, cost) => {
      const key = `${cost.service}${cost.model ? ` (${cost.model})` : ''}`
      if (!acc[key]) {
        acc[key] = { cost: 0, tokens: 0, operations: 0 }
      }
      acc[key].cost += cost.costUsd
      acc[key].tokens += cost.tokensInput + cost.tokensOutput
      acc[key].operations += 1
      return acc
    }, {} as Record<string, { cost: number, tokens: number, operations: number }>)

    return Object.entries(breakdown)
      .sort(([,a], [,b]) => b.cost - a.cost)
      .slice(0, 3) // Show top 3 services
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Total Cost
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {formatCost(totalCost)}
          </div>
          {totalTokens > 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Zap className="h-3 w-3" />
              {formatTokens(totalTokens)} tokens
            </div>
          )}
        </div>

        {costs && costs.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Breakdown
            </div>
            <div className="space-y-1">
              {getServiceBreakdown().map(([service, data]) => (
                <div key={service} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate flex-1 mr-2">{service}</span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-gray-500">{formatTokens(data.tokens)}</span>
                    <span className="font-medium min-w-[50px]">{formatCost(data.cost)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {costs.length > 3 && (
              <div className="text-xs text-gray-500 text-center pt-1 border-t">
                +{costs.length - 3} more operations
              </div>
            )}
          </div>
        )}

        {(!costs || costs.length === 0) && (
          <div className="text-xs text-gray-500 text-center py-2">
            No costs recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
