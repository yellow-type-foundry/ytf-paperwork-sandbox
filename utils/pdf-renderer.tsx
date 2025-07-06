import { pdf } from '@react-pdf/renderer'
import { QuotationDocument } from '@/components/pdf-templates/quotation-document'
import type { QuotationData } from './pdf-generator'

export async function renderQuotationPDF(data: QuotationData): Promise<Blob> {
  console.log('Rendering PDF with data:', data);
  const blob = await pdf(<QuotationDocument data={data} />).toBlob();
  console.log('PDF blob generated:', blob);
  return blob;
} 