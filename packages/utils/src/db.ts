export class DatabaseUtils {
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  static generateId(): string {
    return crypto.randomUUID()
  }

  static formatError(error: any): string {
    if (error?.message) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'Unknown database error'
  }
}
