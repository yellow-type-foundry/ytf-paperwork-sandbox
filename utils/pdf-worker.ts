import { generateQuotationPDF } from './pdf-generator'

self.onmessage = async (e) => {
  try {
    const formData = e.data
    const blob = await generateQuotationPDF(formData)
    self.postMessage({ blob })
  } catch (error) {
    self.postMessage({ 
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 