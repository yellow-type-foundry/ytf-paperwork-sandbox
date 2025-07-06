"use client"

import { useState, useEffect } from "react"
import { pdf } from "@react-pdf/renderer"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PDFRenderer({ documentFactory, fileName, disabled = false }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const generatePDF = async () => {
    if (disabled || !isClient) return

    // Create the PDF document - if null is returned, validation failed
    const document = documentFactory()
    if (!document) return

    setIsGenerating(true)
    setError(null)

    try {
      // Show immediate feedback
      const startTime = performance.now()

      // Use a small timeout to allow the UI to update before the intensive PDF generation
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Generate the PDF blob with a timeout to prevent UI freezing
      const blob = await new Promise((resolve, reject) => {
        // Use requestAnimationFrame to avoid blocking the main thread
        requestAnimationFrame(async () => {
          try {
            const pdfBlob = await pdf(document).toBlob()
            resolve(pdfBlob)
          } catch (error) {
            console.error("Error generating PDF:", error)
            reject(error)
          }
        })
      })

      // Ensure minimum loading time for better UX (at least 500ms)
      const elapsedTime = performance.now() - startTime
      if (elapsedTime < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - elapsedTime))
      }

      // Create a URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError("There was an error generating the PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isClient) {
    return (
      <Button disabled className="bg-yellow-500 hover:bg-yellow-600">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading
      </Button>
    )
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={generatePDF} disabled={disabled || isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>Download PDF</>
        )}
      </Button>
    </div>
  )
}
