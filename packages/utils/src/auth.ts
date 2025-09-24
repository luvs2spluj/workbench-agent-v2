import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTPayload } from './types'

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn })
  }

  static verifyToken(token: string, secret: string): JWTPayload {
    return jwt.verify(token, secret) as JWTPayload
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch {
      return null
    }
  }
}
