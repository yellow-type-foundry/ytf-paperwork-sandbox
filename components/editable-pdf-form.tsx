"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Download } from "lucide-react"

// Define the editable fields with their positions on the PDF
// You'll need to adjust these coordinates based on your specific PDF
const EDITABLE_FIELDS = [
  {
    name: "clientName",
    label: "Client Name",
    x: 150, // X coordinate on the PDF
    y: 500, // Y coordinate on the PDF
    width: 200,
    fontSize: 12,
    required: true,
  },
  {
    name: "clientCompany",
    label: "Company",
    x: 150,
    y: 480,
    width: 200,
    fontSize: 12,
    required: true,
  },
  {
    name: "clientEmail",
    label: "Email",
    x: 150,
    y: 460,
    width: 200,
    fontSize: 12,
    required: true,
  },
  {
    name: "projectName",
    label: "Project Name",
    x: 150,
    y: 420,
    width: 200,
    fontSize: 12,
    required: true,
  },
  {
    name: "licenseDate",
    label: "License Date",
    x: 150,
    y: 400,
    width: 200,
    fontSize: 12,
    required: false,
    defaultValue: new Date().toISOString().split("T")[0],
  },
]

interface EditablePdfFormProps {
  pdfUrl: string // URL to your existing EULA PDF
  fileName?: string // Default filename for the downloaded PDF
}

export function EditablePdfForm({ pdfUrl, fileName = "EULA-Document.pdf" }: EditablePdfFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, string> = {}
    EDITABLE_FIELDS.forEach((field) => {
      if (field.defaultValue) {
        initialData[field.name] = field.defaultValue.toString()
      } else {
        initialData[field.name] = ""
      }
    })
    setFormData(initialData)
  }, [])

  // Load the PDF for preview
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const response = await fetch(pdfUrl)
        const pdfBuffer = await response.arrayBuffer()
        const pdfDoc = await PDFDocument.load(pdfBuffer)
        const pdfBytes = await pdfDoc.save()
        setPdfBytes(pdfBytes)

        // Create a preview URL
        const blob = new Blob([pdfBytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)

        return () => {
          if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
      } catch (error) {
        console.error("Error loading PDF:", error)
      }
    }

    loadPdf()
  }, [pdfUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isFormValid = () => {
    return EDITABLE_FIELDS.filter((field) => field.required).every((field) => formData[field.name])
  }

  const generatePDF = async () => {
    if (!pdfBytes) return

    setIsLoading(true)

    try {
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes)

      // Get the first page
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      // Get the standard font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Add text for each field
      EDITABLE_FIELDS.forEach((field) => {
        const value = formData[field.name] || ""

        // Draw the text on the page
        firstPage.drawText(value, {
          x: field.x,
          y: field.y,
          size: field.fontSize,
          font,
          color: rgb(0, 0, 0),
        })
      })

      // Save the PDF
      const filledPdfBytes = await pdfDoc.save()

      // Create a download link
      const blob = new Blob([filledPdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>EULA Information</CardTitle>
            <CardDescription>Fill in the details for your EULA document</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {EDITABLE_FIELDS.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  type={field.name === "licenseDate" ? "date" : "text"}
                  required={field.required}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600"
              onClick={generatePDF}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>EULA Preview</CardTitle>
            <CardDescription>Preview of your document</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full aspect-[1/1.414] bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full border-0" title="PDF Preview" />
              ) : (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">Loading preview...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
