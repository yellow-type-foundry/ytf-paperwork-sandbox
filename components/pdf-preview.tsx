import { businessSizes } from "@/utils/typeface-data"
import "../styles/typography.css"
import { useEffect, useState } from "react";

function PDFPreview({ formData }: { formData: any }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let url: string | null = null;
    async function generatePdf() {
      const { pdf } = await import("@react-pdf/renderer");
      const { QuotationDocument } = await import("./pdf-templates/quotation-document");
      // Format billing address for preview
      const previewData = {
        ...formData,
        clientAddress: [
          formData.billingAddress?.street,
          formData.billingAddress?.city,
          formData.billingAddress?.country,
          formData.billingAddress?.postalCode
        ].filter(Boolean).join("\n"),
        companyName: formData.billingAddress?.companyName || '',
        businessSize: typeof formData.businessSize === 'string'
          ? businessSizes.find(size => size.id === formData.businessSize) || { name: '', description: '' }
          : formData.businessSize,
        items: (formData.items || []).map((item: any) => ({
          ...item,
        })),
      };
      const instance = pdf(<QuotationDocument data={previewData} />);
      const blob = await instance.toBlob();
      url = URL.createObjectURL(blob);
      if (isMounted) setPdfUrl(url);
    }
    generatePdf();
    return () => {
      isMounted = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [formData]);

  if (!pdfUrl) {
    return <div className="w-full aspect-[1/1.414] flex items-center justify-center bg-stone-200">Generating preview...</div>;
  }

  return (
    <div className="w-full aspect-[1/1.414] shadow-sm overflow-hidden border flex items-center justify-center bg-stone-200">
      <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
    </div>
  );
}

export default PDFPreview;
