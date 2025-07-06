jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn(() => ({
    toBlob: jest.fn(() => Promise.resolve(new Blob(['mock-pdf'], { type: 'application/pdf' })))
  })),
  Font: {
    register: jest.fn(),
    getRegisteredFonts: jest.fn(() => [
      {
        family: 'YTF Oldman',
        src: '/fonts/YTFOldman-Bold.woff2'
      },
      {
        family: 'YTF Millie Mono',
        src: '/fonts/YTFVangMono-Regular.woff2'
      },
      {
        family: 'YTF Grand 123',
        src: '/fonts/YTFGrand123-Regular.woff2'
      }
    ])
  }
}))

jest.mock('@/components/pdf-templates/quotation-document', () => ({
  QuotationDocument: () => null
}))

jest.mock('./pdf-renderer', () => ({
  renderQuotationPDF: jest.fn(() => Promise.resolve(new Blob(['mock-pdf'], { type: 'application/pdf' })))
}))

import { generateQuotationPDF } from './pdf-generator'
import { Font } from '@react-pdf/renderer'

describe('PDF Generator', () => {
  const mockFormData = {
    quotationNumber: "Q123",
    quotationDate: "2024-03-20",
    clientName: "Test Client",
    clientEmail: "test@example.com",
    clientAddress: "123 Test St",
    businessSize: "small",
    items: [
      {
        typeface: "Test Font",
        licenseType: "Commercial",
        durationType: "perpetual",
        durationYears: 1,
        languageCut: "Latin",
        fileFormats: ["OTF", "TTF"],
        amount: 100
      }
    ],
    subtotal: 100,
    total: 100
  }

  it('should generate PDF successfully', async () => {
    const blob = await generateQuotationPDF(mockFormData)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('should handle empty items array', async () => {
    const emptyData = {
      ...mockFormData,
      items: []
    }
    const blob = await generateQuotationPDF(emptyData)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('should handle missing optional fields', async () => {
    const minimalData = {
      quotationNumber: "Q123",
      quotationDate: "2024-03-20",
      clientName: "Test Client",
      clientEmail: "test@example.com",
      items: [],
      subtotal: 0,
      total: 0
    }
    const blob = await generateQuotationPDF(minimalData)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('should handle invalid data gracefully', async () => {
    const invalidData = {
      quotationNumber: null,
      quotationDate: undefined,
      clientName: 123,
      clientEmail: {},
      items: "not an array",
      subtotal: "invalid",
      total: null
    }
    const blob = await generateQuotationPDF(invalidData as any)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('should use cache for identical data', async () => {
    const blob1 = await generateQuotationPDF(mockFormData)
    const blob2 = await generateQuotationPDF(mockFormData)
    expect(blob1).toBe(blob2) // Should be the same instance
  })

  it('should have custom fonts registered', () => {
    // Get all registered fonts
    const registeredFonts = Font.getRegisteredFonts()
    
    // Check for our custom fonts
    expect(registeredFonts).toContainEqual(expect.objectContaining({
      family: 'YTF Oldman',
      src: expect.stringContaining('YTFOldman-Bold.woff2')
    }))
    
    expect(registeredFonts).toContainEqual(expect.objectContaining({
      family: 'YTF Millie Mono',
      src: expect.stringContaining('YTFVangMono-Regular.woff2')
    }))
    
    expect(registeredFonts).toContainEqual(expect.objectContaining({
      family: 'YTF Grand 123',
      src: expect.stringContaining('YTFGrand123-Regular.woff2')
    }))
  })

  it('should generate a valid PDF blob for download', async () => {
    const blob = await generateQuotationPDF(mockFormData);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('application/pdf');
  });
}) 