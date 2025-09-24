import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUserSchema, loginSchema } from '@langchain-flow/utils'
import { supabase, handleSupabaseResponse } from '../config/supabase'
import { getEnv } from '../config/env'

const env = getEnv()

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createUserSchema.parse(req.body)
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', validatedData.username)
        .single()
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        })
      }
      
      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', validatedData.email)
        .single()
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        })
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 12)
      
      // Create user
      const user = await handleSupabaseResponse(
        supabase
          .from('users')
          .insert({
            username: validatedData.username,
            email: validatedData.email,
            password_hash: passwordHash,
          })
          .select('id, username, email, created_at')
          .single()
      )
      
      // Generate JWT tokens
      const tokens = AuthController.generateTokens({
        userId: user.id,
        username: user.username,
      })
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.created_at,
          },
          ...tokens,
        },
      })
    } catch (error) {
      next(error)
    }
  }
  
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body)
      
      // Find user
      const user = await handleSupabaseResponse(
        supabase
          .from('users')
          .select('id, username, email, password_hash, created_at')
          .eq('username', validatedData.username)
          .single()
      )
      
      // Verify password
      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        user.password_hash
      )
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        })
      }
      
      // Generate JWT tokens
      const tokens = AuthController.generateTokens({
        userId: user.id,
        username: user.username,
      })
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.created_at,
          },
          ...tokens,
        },
      })
    } catch (error) {
      next(error)
    }
  }
  
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        })
      }
      
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as any
      
      // Generate new tokens
      const tokens = AuthController.generateTokens({
        userId: decoded.userId,
        username: decoded.username,
      })
      
      res.json({
        success: true,
        data: tokens,
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      })
    }
  }
  
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        })
      }
      
      const user = await handleSupabaseResponse(
        supabase
          .from('users')
          .select('id, username, email, created_at, updated_at')
          .eq('id', userId)
          .single()
      )
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      })
    } catch (error) {
      next(error)
    }
  }
  
  private static generateTokens(payload: { userId: string; username: string }) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    })
    
    const refreshToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    })
    
    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
    }
  }
}
