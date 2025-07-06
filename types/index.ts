export interface FormItem {
  typefaceFamily: string
  typefaceVariant: string
  typeface: string
  basePrice: number
  amount: number
  licenseType: string
  usage: string
}

export interface FormData {
  clientName: string
  clientEmail: string
  clientAddress: string
  quotationNumber: string
  quotationDate: string
  businessSize: string
  items: FormItem[]
  subtotal: number
  tax: number
  total: number
  billingAddress: {
    companyName: string
    street: string
    suburb: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface BusinessSize {
  id: string
  name: string
  description: string
  multiplier: number | null
}

export interface Font {
  family: string
  variant: string
  value: string
  label: string
}

export interface PDFDocumentProps {
  data: {
    quotationNumber: string
    quotationDate: string
    clientName: string
    clientEmail: string
    clientAddress?: string
    businessSize?: BusinessSize
    items: Array<{
      typeface: string
      amount: number
    }>
    subtotal: number
    total: number
  }
}

export interface PDFRendererProps {
  documentFactory: () => Promise<Blob>
  fileName: string
}

export interface FontSelectorProps {
  onSelectionChange: (fonts: Font[]) => void
  selectedFonts?: Font[]
}

export interface QuotationData {
  quotationNumber: string
  quotationDate: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  businessSize?: {
    name: string
    description: string
  }
  items: Array<{
    typeface: string
    licenseType: string
    usage: string
    amount: number
  }>
  subtotal: number
  discount: number
  total: number
  companyName?: string
}

export interface LicenseType {
  id: string
  name: string
  requiresManualUsage: boolean
}

export interface UsageOption {
  id: string
  name: string
  multiplier?: number
}

export interface FontCategory {
  family: string
  category: 'Sans' | 'Serif'
} 