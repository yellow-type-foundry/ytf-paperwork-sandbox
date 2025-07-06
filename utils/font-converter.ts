/**
 * Utility for font conversion
 * This is a placeholder for the actual conversion process
 * In a production environment, you would use a server-side process to convert fonts
 */

import opentype from "opentype.js"

// For now, we'll use a simple approach to convert woff2 to a format jsPDF can use
export async function convertWoff2ToTtf(woff2Buffer: ArrayBuffer): Promise<ArrayBuffer> {
  try {
    // Load the WOFF2 font
    const font = await opentype.load(woff2Buffer)
    
    // Convert to TTF format
    const ttfBuffer = font.toArrayBuffer()
    
    return ttfBuffer
  } catch (error) {
    console.error("Error converting font:", error)
    throw error
  }
}

// Helper function to convert ArrayBuffer to base64
export function arrayBufferToBase64(buffer) {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
