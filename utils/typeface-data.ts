// Structured data for YTF typefaces
export const ytfTypefaces = [
  {
    family: "YTF Oldman",
    variants: ["Thin", "Light", "Regular", "Medium", "Bold", "Black"],
    basePrice: 90.0,
    totalStyles: 6,
  },
  {
    family: "YTF Eon A",
    variants: ["Regular", "Medium", "Bold", "Black"],
    basePrice: 90.0,
    totalStyles: 4,
  },
  {
    family: "YTF Eon B",
    variants: ["Regular", "Medium", "Bold", "Black"],
    basePrice: 90.0,
    totalStyles: 4,
  },
  {
    family: "YTF Eon C",
    variants: ["Regular", "Medium", "Bold", "Black"],
    basePrice: 90.0,
    totalStyles: 4,
  },
  {
    family: "YTF Xanh",
    variants: ["Thin", "Light", "Regular", "Thin Italic", "Light Italic", "Regular Italic"],
    basePrice: 100.0,
    totalStyles: 6,
  },
  {
    family: "YTF Xanh Mono",
    variants: ["Thin", "Light", "Regular", "Thin Italic", "Light Italic", "Regular Italic"],
    basePrice: 100.0,
    totalStyles: 6,
  },
  {
    family: "YTF Cafuné Sans",
    variants: ["Air", "Thin", "UltraLight", "Light", "Book", "Medium", "Bold", "Heavy"],
    basePrice: 90.0,
    totalStyles: 8,
  },
  {
    family: "YTF Cafuné",
    variants: [
      "Thin",
      "Light",
      "UltraLight",
      "Book",
      "Medium",
      "Bold",
      "Heavy",
      "Thin Italic",
      "Light Italic",
      "UltraLight Italic",
      "Book Italic",
      "Medium Italic",
      "Bold Italic",
      "Heavy Italic",
    ],
    basePrice: 100.0,
    totalStyles: 14,
  },
  {
    family: "YTF Millie",
    variants: [
      "Thin",
      "Light",
      "Regular",
      "Medium",
      "Bold",
      "Heavy",
      "Black",
      "Thin Italic",
      "Light Italic",
      "Regular Italic",
      "Medium Italic",
      "Bold Italic",
      "Heavy Italic",
      "Black Italic",
    ],
    basePrice: 90.0,
    totalStyles: 14,
  },
  {
    family: "YTF Millie Mono",
    variants: ["Light", "Regular", "Medium", "Bold", "Light Italic", "Regular Italic", "Medium Italic", "Bold Italic"],
    basePrice: 90.0,
    totalStyles: 8,
  },
  {
    family: "YTF Gióng",
    variants: ["Roman", "Italic"],
    basePrice: 100.0,
    totalStyles: 2,
  },
]

// License types
export const licenseTypes = [
  { id: "desktop", name: "Desktop", requiresManualUsage: false },
  { id: "web", name: "Web", requiresManualUsage: false },
  { id: "logo", name: "Logo & Wordmark", requiresManualUsage: false },
  { id: "app", name: "App / Software", requiresManualUsage: true },
  { id: "broadcast", name: "Broadcast", requiresManualUsage: true },
  { id: "packaging", name: "Packaging", requiresManualUsage: true },
  { id: "merchandising", name: "Merchandising", requiresManualUsage: true },
  { id: "publishing", name: "Publishing", requiresManualUsage: true },
]

// Usage options for different license types
export const usageOptions = {
  // For Desktop, Web, and Logo (auto-populated from business size)
  business: [
    { id: "xs", name: "XS — under 20 employees", multiplier: 2 },
    { id: "s", name: "S — under 50 employees", multiplier: 4 },
    { id: "m", name: "M — under 150 employees", multiplier: 4 },
    { id: "l", name: "L — under 250 employees", multiplier: 5 },
    { id: "xl", name: "XL — under 500 employees", multiplier: 6 },
  ],
  // For App / Software
  app: [
    { id: "5k", name: "Up to 5K users", multiplier: 1.5 },
    { id: "10k", name: "Up to 10K users", multiplier: 2 },
    { id: "100k", name: "Up to 100K users", multiplier: 3 },
    { id: "500k", name: "Up to 500K users", multiplier: 5 },
    { id: "1m", name: "Up to 1M users", multiplier: 8 },
  ],
  // For Broadcast
  broadcast: [
    { id: "50k", name: "Under $50K", multiplier: 1.5 },
    { id: "250k", name: "$50K–250K", multiplier: 2.5 },
    { id: "750k", name: "$250K–750K", multiplier: 4 },
    { id: "2m", name: "$750K–2M", multiplier: 5 },
    { id: "2m+", name: "Over $2M", multiplier: 8 },
  ],
  // For Packaging, Merchandising, Publishing
  packaging: [
    { id: "5k", name: "Under 5K units", multiplier: 2 },
    { id: "50k", name: "Under 50K units", multiplier: 5 },
    { id: "500k", name: "Under 500K units", multiplier: 8 },
  ],
}

// Font categories for pricing
export const fontCategories = [
  // Sans fonts
  { family: "YTF Millie", category: "Sans" },
  { family: "YTF Millie Mono", category: "Sans" },
  { family: "YTF Cafuné Sans", category: "Sans" },
  { family: "YTF Eon A", category: "Sans" },
  { family: "YTF Eon B", category: "Sans" },
  { family: "YTF Eon C", category: "Sans" },
  { family: "YTF Oldman", category: "Sans" },
  // Serif fonts
  { family: "YTF Gióng", category: "Serif" },
  { family: "YTF Cafuné", category: "Serif" },
  { family: "YTF Xanh", category: "Serif" },
  { family: "YTF Xanh Mono", category: "Serif" },
]

// Base license prices by category and business size
export const baseLicensePrices = {
  Sans: {
    individual: 90,
    xs: 180,
    s: 270,
    m: 450,
    l: 720,
    xl: 900,
  },
  Serif: {
    individual: 100,
    xs: 200,
    s: 300,
    m: 500,
    l: 800,
    xl: 1000,
  },
}

// Discount caps by business size
export const discountCaps = {
  individual: 0,
  xs: 30,
  s: 30,
  m: 20,
  l: 20,
  xl: 10,
}

// Business sizes and license multipliers
export const businessSizes = [
  {
    id: "individual",
    name: "Individual",
    description: "For sole individuals only. No commercial use.",
    multiplier: 1,
    employeeCount: "N/A",
  },
  {
    id: "xs",
    name: "XS — Business",
    description: "For businesses with fewer than 20 employees",
    multiplier: 2,
    employeeCount: "<20",
  },
  {
    id: "s",
    name: "S — Business",
    description: "For businesses with fewer than 50 employees",
    multiplier: 3,
    employeeCount: "<50",
  },
  {
    id: "m",
    name: "M — Business",
    description: "For businesses with fewer than 150 employees",
    multiplier: 5,
    employeeCount: "<150",
  },
  {
    id: "l",
    name: "L — Business",
    description: "For businesses with fewer than 250 employees",
    multiplier: 8,
    employeeCount: "<250",
  },
  {
    id: "xl",
    name: "XL — Business",
    description: "For businesses with fewer than 500 employees",
    multiplier: 10,
    employeeCount: "<500",
  },
]

// File format options
export const fileFormatOptions = [
  { id: "otf", name: "OTF", multiplier: 1 },
  { id: "ttf", name: "TTF", multiplier: 1 },
  { id: "woff", name: "WOFF", multiplier: 1 },
  { id: "woff2", name: "WOFF2", multiplier: 1 }
]

// Duration options
export const durationOptions = [
  { id: "perpetual", name: "Perpetual", multiplier: 1 },
]

// Helper function to get language/cut options based on variant
export function getLanguageCutForVariant(variant: string): string {
  if (variant.includes("Italic")) {
    return "Latin, Italic"
  } else if (variant === "Roman") {
    return "Latin, Roman"
  } else if (variant === "Bold") {
    return "Latin, Bold"
  } else if (variant === "Medium") {
    return "Latin, Medium"
  } else if (variant === "Light") {
    return "Latin, Light"
  } else if (variant === "Thin") {
    return "Latin, Thin"
  } else if (variant === "Black") {
    return "Latin, Black"
  } else if (variant === "Heavy") {
    return "Latin, Heavy"
  } else if (variant === "Book") {
    return "Latin, Book"
  } else if (variant === "UltraLight") {
    return "Latin, UltraLight"
  } else if (variant === "Air") {
    return "Latin, Air"
  } else {
    return "Latin, Medium" // Default
  }
}

// Calculate duration multiplier based on years
export function calculateDurationMultiplier(durationYears: number): number {
  if (durationYears <= 0) return 0
  return 1 // Only perpetual supported
}

// Helper function to calculate the license price based on base price, business size, file formats, duration, and discounts
export const calculateLicensePrice = (
  basePrice: number,
  businessSize: string,
  fileFormats: string[],
  durationType: string,
  durationYears: number
): number => {
  // Get business size multiplier
  const businessSizeObj = businessSizes.find((size) => size.id === businessSize)
  const multiplier = businessSizeObj?.multiplier || 1

  // Calculate base price with business size multiplier
  let price = basePrice * multiplier

  // Double price if both OTF/TTF and WOFF/WOFF2 are selected
  const hasDesktop = fileFormats.includes("otf") && fileFormats.includes("ttf");
  const hasWeb = fileFormats.includes("woff") && fileFormats.includes("woff2");
  if (hasDesktop && hasWeb) {
    price *= 2;
  }

  // No custom duration logic
  return price
}

// Helper function to get a typeface by family name
export function getTypefaceByFamily(family: string) {
  return ytfTypefaces.find((typeface) => typeface.family === family)
}

// Helper function to format file formats for display
export function formatFileFormats(fileFormats: string[]): string {
  if (fileFormats.length === 0) return ""

  return fileFormats
    .map((format) => {
      const option = fileFormatOptions.find((opt) => opt.id === format)
      return option ? option.name.toUpperCase() : format.toUpperCase()
    })
    .join(", ")
}

// Helper function to format duration for display
export function formatDuration(durationType: string, durationYears = 1): string {
  return "Perpetual"
}

// Helper function to get duration pricing explanation
export function getDurationPricingExplanation(durationType: string, durationYears = 1): string {
  return "Perpetual license"
}

// Helper function to get font category
export function getFontCategory(family: string): 'Sans' | 'Serif' {
  const category = fontCategories.find(font => font.family === family)
  return (category?.category as 'Sans' | 'Serif') || 'Sans' // Default to Sans if not found
}

// Helper function to get available license types based on business size
export function getAvailableLicenseTypes(businessSize: string) {
  if (businessSize === 'individual') {
    return licenseTypes.filter(lt => ['desktop', 'web'].includes(lt.id))
  }
  return licenseTypes
}

// Helper function to get usage options for a license type
export function getUsageOptionsForLicenseType(licenseType: string) {
  switch (licenseType) {
    case 'desktop':
    case 'web':
    case 'logo':
      return usageOptions.business
    case 'app':
      return usageOptions.app
    case 'broadcast':
      return usageOptions.broadcast
    case 'packaging':
    case 'merchandising':
    case 'publishing':
      return usageOptions.packaging
    default:
      return []
  }
}

// Helper function to get usage value for business-size-based licenses
export function getBusinessSizeUsage(businessSize: string): string {
  if (businessSize === 'individual') {
    return 'Non-commercial use'
  }
  // Return the business size ID (xs, s, m, l, xl) which matches the usage option IDs
  return businessSize
}

// Helper function to calculate base license price
export function calculateBaseLicensePrice(family: string, businessSize: string): number {
  const category = getFontCategory(family)
  const prices = baseLicensePrices[category]
  return prices[businessSize as keyof typeof prices] || 0
}

// Helper function to get license multiplier
export function getLicenseMultiplier(licenseType: string, usage: string): number {
  // Desktop and Web have no multiplier
  if (['desktop', 'web'].includes(licenseType)) {
    return 1
  }
  
  // For Logo license, find multiplier by usage ID
  if (licenseType === 'logo') {
    const businessUsage = usageOptions.business.find(option => option.id === usage)
    return businessUsage?.multiplier || 1
  }
  
  // For other license types, find the multiplier based on usage ID
  let options
  switch (licenseType) {
    case 'app':
      options = usageOptions.app
      break
    case 'broadcast':
      options = usageOptions.broadcast
      break
    case 'packaging':
    case 'merchandising':
    case 'publishing':
      options = usageOptions.packaging
      break
    default:
      return 1
  }
  
  const option = options.find(opt => opt.id === usage)
  return option?.multiplier || 1
}

// Helper function to calculate final price for an item
export function calculateItemPrice(
  family: string,
  businessSize: string,
  licenseType: string,
  usage: string
): number {
  // Individual license has fixed pricing (no multiplier, no discount)
  if (businessSize === 'individual') {
    const category = getFontCategory(family)
    return category === 'Sans' ? 90 : 100
  }
  
  // Calculate base price based on font category and business size
  const basePrice = calculateBaseLicensePrice(family, businessSize)
  
  // Apply multiplier only for custom license types (not Desktop/Web)
  const multiplier = getLicenseMultiplier(licenseType, usage)
  
  return basePrice * multiplier
}

// Helper function to calculate discount
export function calculateDiscount(
  items: Array<{ licenseType: string; amount: number; typefaceFamily: string; typefaceVariant: string }>,
  businessSize: string
): { percentage: number; amount: number; subtotal: number } {
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
  
  // No discount for Individual licenses
  if (businessSize === 'individual') {
    return {
      percentage: 0,
      amount: 0,
      subtotal
    }
  }
  
  // Count unique styles and license types
  const uniqueStyles = new Set(items.map(item => `${item.typefaceFamily} ${item.typefaceVariant}`)).size
  const uniqueLicenseTypes = new Set(items.map(item => item.licenseType)).size
  
  // Apply discount only when one or both conditions are met:
  // 1. 2 or more font styles are included
  // 2. 2 or more license types are selected
  if (uniqueStyles < 2 && uniqueLicenseTypes < 2) {
    return {
      percentage: 0,
      amount: 0,
      subtotal
    }
  }
  
  // Calculate style discount
  let styleDiscount = 0
  if (uniqueStyles >= 4) styleDiscount = 20
  else if (uniqueStyles === 3) styleDiscount = 15
  else if (uniqueStyles === 2) styleDiscount = 10
  
  // Calculate license type discount
  let licenseDiscount = 0
  if (uniqueLicenseTypes >= 3) licenseDiscount = 10
  else if (uniqueLicenseTypes === 2) licenseDiscount = 5
  
  // Total discount percentage
  let totalDiscountPercent = styleDiscount + licenseDiscount
  
  // Apply cap based on business size
  const cap = discountCaps[businessSize as keyof typeof discountCaps] || 0
  totalDiscountPercent = Math.min(totalDiscountPercent, cap)
  
  // Calculate discount amount and round to nearest dollar
  const discountAmount = Math.round((subtotal * totalDiscountPercent) / 100)
  
  return {
    percentage: totalDiscountPercent,
    amount: discountAmount,
    subtotal
  }
}
