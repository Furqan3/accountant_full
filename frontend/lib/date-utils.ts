export function getTimeRemaining(dueDate: string): string {
  const now = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return "Overdue"
  } else if (diffDays === 0) {
    return "Due today"
  } else if (diffDays === 1) {
    return "in 1 day"
  } else if (diffDays < 30) {
    return `in ${diffDays} days`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return months === 1 ? "in 1 month" : `in ${months} months`
  } else {
    const years = Math.floor(diffDays / 365)
    return years === 1 ? "in 1 year" : `in ${years} years`
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function calculateCorporationTaxDue(yearEndDate: { day: string; month: string }): string {
  const currentYear = new Date().getFullYear()
  const yearEnd = new Date(currentYear, parseInt(yearEndDate.month) - 1, parseInt(yearEndDate.day))

  // If year end has passed, use next year
  if (yearEnd < new Date()) {
    yearEnd.setFullYear(currentYear + 1)
  }

  // Corporation tax is due 9 months and 1 day after year end
  const taxDue = new Date(yearEnd)
  taxDue.setMonth(taxDue.getMonth() + 9)
  taxDue.setDate(taxDue.getDate() + 1)

  return taxDue.toISOString().split('T')[0]
}
