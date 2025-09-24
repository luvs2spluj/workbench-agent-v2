import { ApiResponse, PaginatedResponse } from './types'

export class ApiUtils {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    }
  }

  static error(error: string, message?: string): ApiResponse {
    return {
      success: false,
      error,
      message
    }
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static formatValidationError(errors: any[]): string {
    return errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
  }
}
