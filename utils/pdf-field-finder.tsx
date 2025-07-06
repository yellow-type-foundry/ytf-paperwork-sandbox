"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * This is a utility component to help you find the correct coordinates
 * for placing text on your PDF. You can use this during development
 * to determine where to place editable fields.
 */
export function PdfFieldFinder({ pdfUrl }: { pdfUrl: string }) {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
  const [fieldName, setFieldName] = useState("")
  const [fields, setFields] = useState<Array<{ name: string; x: number; y: number }>>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const loadPdf = async () => {
      try {
        // This is a simplified version - in a real implementation,
        // you would use pdf.js to render the PDF to a canvas
        const canvas = canvasRef.current
        if (!canvas) return

        // Set canvas dimensions (A4 size in pixels at 72 DPI)
        const width = 595
        const height = 842
        canvas.width = width
        canvas.height = height
        setPdfDimensions({ width, height })

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Draw a white background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)

        // Add a message
        ctx.fillStyle = "#000000"
        ctx.font = "16px Arial"
        ctx.fillText("Click anywhere on this canvas to get coordinates", 50, 50)
        ctx.fillText("for placing fields on your PDF", 50, 70)
      } catch (error) {
        console.error("Error loading PDF:", error)
      }
    }

    loadPdf()
  }, [pdfUrl])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width))
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height))

    setCoordinates({ x, y })
  }

  const addField = () => {
    if (!fieldName) return

    setFields([...fields, { name: fieldName, x: coordinates.x, y: coordinates.y }])
    setFieldName("")
  }

  const copyFieldsToClipboard = () => {
    const fieldsCode = fields
      .map(
        (field) =>
          `  {
    name: "${field.name}",
    label: "${field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, " $1")}",
    x: ${field.x},
    y: ${field.y},
    width: 200,
    fontSize: 12,
    required: true,
  },`,
      )
      .join("\n")

    navigator.clipboard.writeText(fieldsCode)
    alert("Field definitions copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-2">PDF Field Finder Tool</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click on the canvas below to find coordinates for placing fields on your PDF.
        </p>

        <div className="border rounded-md overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full cursor-crosshair"
            style={{ height: `${pdfDimensions.height * 0.5}px` }}
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <Label>X Coordinate</Label>
            <Input value={coordinates.x} readOnly />
          </div>
          <div>
            <Label>Y Coordinate</Label>
            <Input value={coordinates.y} readOnly />
          </div>
          <div className="flex-1">
            <Label>Field Name</Label>
            <Input value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="e.g. clientName" />
          </div>
          <div className="pt-6">
            <Button onClick={addField}>Add Field</Button>
          </div>
        </div>

        {fields.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Added Fields:</h4>
            <ul className="text-sm space-y-1">
              {fields.map((field, index) => (
                <li key={index}>
                  {field.name}: x={field.x}, y={field.y}
                </li>
              ))}
            </ul>
            <Button onClick={copyFieldsToClipboard} variant="outline" size="sm">
              Copy Fields to Clipboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
