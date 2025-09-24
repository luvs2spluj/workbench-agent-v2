import { NextRequest, NextResponse } from 'next/server'
import { createRunSchema } from '@langchain-flow/utils'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createRunSchema.parse(body)
    
    // Create run in database
    const { data: run, error } = await supabase
      .from('runs')
      .insert({
        project_id: validatedData.projectId,
        name: validatedData.name,
        trigger_type: validatedData.triggerType,
        config: validatedData.config,
        status: 'queued',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating run:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create run' },
        { status: 500 }
      )
    }

    // TODO: Enqueue run for processing
    // This would typically send the run to a queue like BullMQ/Redis
    // For now, we'll just log it
    console.log('Run created and queued:', run.id)

    return NextResponse.json({
      success: true,
      data: {
        id: run.id,
        projectId: run.project_id,
        name: run.name,
        status: run.status,
        triggerType: run.trigger_type,
        config: run.config,
        createdAt: run.created_at,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/run:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
