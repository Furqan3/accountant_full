/**
 * Shared Utility Functions
 *
 * Common utilities that can be used across both frontend and adminside apps.
 */

/**
 * Format currency to GBP
 */
export const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date to UK format
 */
export const formatDate = (date: string | Date, includeTime: boolean = false): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  if (includeTime) {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
  }).format(d)
}

/**
 * Truncate text to specified length
 */
export const truncate = (text: string, length: number = 100): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Capitalize first letter of each word
 */
export const capitalize = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate a random ID
 */
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Get order status color for UI
 */
export const getOrderStatusColor = (
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
): string => {
  const colors = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    cancelled: 'red',
  }
  return colors[status] || 'gray'
}

/**
 * Get payment status color for UI
 */
export const getPaymentStatusColor = (
  status: 'pending' | 'paid' | 'failed' | 'refunded'
): string => {
  const colors = {
    pending: 'yellow',
    paid: 'green',
    failed: 'red',
    refunded: 'orange',
  }
  return colors[status] || 'gray'
}

/**
 * Calculate order total from items
 */
export const calculateOrderTotal = (items: Array<{ price: number; quantity?: number }>): number => {
  return items.reduce((total, item) => {
    const quantity = item.quantity || 1
    return total + item.price * quantity
  }, 0)
}

/**
 * Format UK company number
 */
export const formatCompanyNumber = (number: string): string => {
  // UK company numbers are 8 digits, pad with zeros if needed
  return number.padStart(8, '0')
}

/**
 * Parse error message from various error types
 */
export const parseErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'An unknown error occurred'
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
