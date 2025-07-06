import { renderQuotationPDF } from './pdf-renderer'
import { businessSizes } from "./typeface-data"

interface QuotationData {
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
}

// Cache for PDF blobs
const pdfCache = new Map<string, Blob>()

export async function generateQuotationPDF(formData: any): Promise<Blob> {
  try {
    console.log('Input formData:', formData);
    // Create a cache key from the form data
    const cacheKey = JSON.stringify({
      quotationNumber: formData.quotationNumber,
      items: (Array.isArray(formData.items) ? formData.items : []).map((item: any) => ({
        typeface: item.typeface || "",
        amount: Number(item.amount) || 0
      }))
    });
    console.log('Cache key:', cacheKey);

    // Check if we have a cached version
    const cachedBlob = pdfCache.get(cacheKey)
    if (cachedBlob) {
      console.log('Using cached PDF blob');
      return cachedBlob
    }
    
    // Transform form data to match QuotationDocument interface
    const transformedData: QuotationData = {
      quotationNumber: formData.quotationNumber || "",
      quotationDate: formData.quotationDate || "",
      clientName: formData.clientName || "",
      clientEmail: formData.clientEmail || "",
      clientAddress: formData.clientAddress || "",
      businessSize: businessSizes.find(size => size.id === formData.businessSize),
      items: (Array.isArray(formData.items) ? formData.items : []).map((item: any) => {
        const safeItem = {
          typeface: String(item.typeface || ""),
          licenseType: String(item.licenseType || ""),
          usage: String(item.usage || ""),
          amount: Number(item.amount) || 0
        }
        return safeItem
      }),
      subtotal: Number(formData.subtotal) || 0,
      discount: Number(formData.discount) || 0,
      total: Number(formData.total) || 0
    }
    console.log('Transformed data:', transformedData);

    // Call the renderer (which uses JSX) in a separate file
    const blob = await renderQuotationPDF(transformedData)
    if (!blob) {
      throw new Error("Failed to generate PDF blob")
    }
    console.log('Generated PDF blob:', blob);
    pdfCache.set(cacheKey, blob)
    return blob
  } catch (error: unknown) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export type { QuotationData }
