// ==============================================
// CENTRALIZED SERVICES & PRICING CONFIGURATION
// ==============================================
// Update prices here - they will reflect across the entire project
// All prices are in PENCE (e.g., £39 = 3900)

export interface ServiceConfig {
  id: string
  name: string
  slug: string
  description: string
  price: number // in pence
  vatIncluded: boolean
  additionalFees?: {
    name: string
    amount: number // in pence
    description?: string
  }[]
  category: 'filing' | 'registration' | 'changes' | 'accounting'
  popular?: boolean
}

export const SERVICES: ServiceConfig[] = [
  // Filing Services
  {
    id: 'confirmation-statement',
    name: 'File Confirmation Statement',
    slug: 'confirmation-statement',
    description: 'Annual confirmation statement filing with Companies House',
    price: 3900, // £39
    vatIncluded: true,
    additionalFees: [
      {
        name: 'Companies House Fee',
        amount: 5000, // £50
        description: 'Statutory filing fee payable to Companies House'
      }
    ],
    category: 'filing',
    popular: true
  },
  {
    id: 'dormant-accounts',
    name: 'File Dormant Accounts',
    slug: 'dormant-accounts',
    description: 'Dormant company accounts preparation and filing',
    price: 14900, // £149
    vatIncluded: true,
    category: 'filing'
  },
  {
    id: 'company-dissolution',
    name: 'Company Dissolution',
    slug: 'company-dissolution',
    description: 'Strike off and dissolve your limited company',
    price: 18900, // £189
    vatIncluded: true,
    category: 'filing'
  },

  // Registration Services
  {
    id: 'vat-registration',
    name: 'Register Company for VAT',
    slug: 'vat-registration',
    description: 'VAT registration with HMRC',
    price: 5900, // £59
    vatIncluded: true,
    category: 'registration',
    popular: true
  },
  {
    id: 'paye-registration',
    name: 'Register Company for PAYE',
    slug: 'paye-registration',
    description: 'PAYE employer registration with HMRC',
    price: 4900, // £49
    vatIncluded: true,
    category: 'registration'
  },
  {
    id: 'utr-registration',
    name: 'UTR Registration',
    slug: 'utr-registration',
    description: 'Unique Taxpayer Reference registration',
    price: 4999, // £49.99
    vatIncluded: true,
    category: 'registration'
  },

  // Company Changes
  {
    id: 'change-company-name',
    name: 'Change Company Name',
    slug: 'change-company-name',
    description: 'Change your company name at Companies House',
    price: 5999, // £59.99
    vatIncluded: true,
    category: 'changes'
  },
  {
    id: 'change-registered-address',
    name: 'Change Registered Address',
    slug: 'change-registered-address',
    description: 'Update your registered office address',
    price: 4999, // £49.99
    vatIncluded: true,
    category: 'changes'
  },
  {
    id: 'change-directors',
    name: 'Change Your Directors',
    slug: 'change-directors',
    description: 'Appoint, resign or update director details',
    price: 3999, // £39.99
    vatIncluded: true,
    category: 'changes'
  },

  // Accounting Services
  {
    id: 'certified-accounting',
    name: 'Certified Accounting Services',
    slug: 'certified-accounting',
    description: 'Professional certified accounting services',
    price: 0, // Contact for quote
    vatIncluded: true,
    category: 'accounting'
  }
]

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Get a service by its ID
 */
export function getServiceById(id: string): ServiceConfig | undefined {
  return SERVICES.find(service => service.id === id)
}

/**
 * Get a service by its slug
 */
export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return SERVICES.find(service => service.slug === slug)
}

/**
 * Get all services in a category
 */
export function getServicesByCategory(category: ServiceConfig['category']): ServiceConfig[] {
  return SERVICES.filter(service => service.category === category)
}

/**
 * Get popular services
 */
export function getPopularServices(): ServiceConfig[] {
  return SERVICES.filter(service => service.popular)
}

/**
 * Format price for display (e.g., "£39.00")
 */
export function formatPrice(priceInPence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(priceInPence / 100)
}

/**
 * Get total price including additional fees
 */
export function getTotalPrice(service: ServiceConfig): number {
  const additionalFeesTotal = service.additionalFees?.reduce((sum, fee) => sum + fee.amount, 0) || 0
  return service.price + additionalFeesTotal
}

/**
 * Format total price with breakdown
 */
export function getPriceBreakdown(service: ServiceConfig): {
  servicePrice: string
  additionalFees: { name: string; amount: string }[]
  total: string
  totalInPence: number
} {
  const additionalFees = service.additionalFees?.map(fee => ({
    name: fee.name,
    amount: formatPrice(fee.amount)
  })) || []

  const totalInPence = getTotalPrice(service)

  return {
    servicePrice: formatPrice(service.price),
    additionalFees,
    total: formatPrice(totalInPence),
    totalInPence
  }
}

/**
 * Get service display name from ID (for emails, etc.)
 */
export function getServiceDisplayName(serviceId: string): string {
  const service = getServiceById(serviceId)
  return service?.name || serviceId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// ==============================================
// SERVICE CATEGORIES FOR UI
// ==============================================

export const SERVICE_CATEGORIES = [
  {
    id: 'filing',
    name: 'Filing Services',
    description: 'Company filings and statutory submissions'
  },
  {
    id: 'registration',
    name: 'Registration Services',
    description: 'Tax and business registrations'
  },
  {
    id: 'changes',
    name: 'Company Changes',
    description: 'Update your company details'
  },
  {
    id: 'accounting',
    name: 'Accounting Services',
    description: 'Professional accounting support'
  }
] as const

// ==============================================
// EXPORT FOR DIFFERENT USE CASES
// ==============================================

// For dropdowns/selects
export const SERVICE_OPTIONS = SERVICES.map(s => ({
  value: s.id,
  label: s.name,
  price: s.price
}))

// Service ID to Name mapping (for quick lookups)
export const SERVICE_NAMES: Record<string, string> = SERVICES.reduce((acc, s) => {
  acc[s.id] = s.name
  return acc
}, {} as Record<string, string>)

// Service ID to Price mapping
export const SERVICE_PRICES: Record<string, number> = SERVICES.reduce((acc, s) => {
  acc[s.id] = s.price
  return acc
}, {} as Record<string, number>)
