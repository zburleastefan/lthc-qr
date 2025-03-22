"use client"

// Create a new component for ultra-compact QR codes
import type React from "react"
import { useRef, useEffect, useState } from "react"
import QRCode from "qrcode"

interface UltraCompactQRProps {
  value: string
  size: number
  fgColor: string
  bgColor: string
  logoImage?: string
  logoSize?: number
}

const UltraCompactQR: React.FC<UltraCompactQRProps> = ({ value, size, fgColor, bgColor, logoImage, logoSize = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)
    setError(null)

    // Generate QR code with minimal settings
    QRCode.toCanvas(
      canvas,
      value,
      {
        width: size,
        margin: 0, // No margin
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: "L", // Lowest error correction
        version: 40, // Maximum version for more data
      },
      (err: Error | null | undefined) => {
        if (err) {
          console.error("Error generating QR code:", err)
          setError(err?.message || "Unknown error")

          // Try with even more minimal settings if there's an error
          if (typeof err.message === "string" && err.message.includes("too big")) {
            try {
              // Create a text QR code instead
              QRCode.toCanvas(
                canvas,
                value.substring(0, 100), // Truncate to ensure it fits
                {
                  width: size,
                  margin: 0,
                  color: {
                    dark: fgColor,
                    light: bgColor,
                  },
                  errorCorrectionLevel: "L",
                },
              )
            } catch (e) {
              console.error("Failed to create fallback QR code:", e)
            }
          }
        } else if (logoImage && ctx) {
          // Add logo if provided
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = logoImage

          img.onload = () => {
            // Create white background for logo
            const logoX = (size - logoSize) / 2
            const logoY = (size - logoSize) / 2

            // Draw white background circle
            ctx.fillStyle = bgColor
            ctx.beginPath()
            ctx.arc(size / 2, size / 2, logoSize / 2 + 5, 0, Math.PI * 2)
            ctx.fill()

            // Draw logo
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
          }
        }
      },
    )
  }, [value, size, fgColor, bgColor, logoImage, logoSize])

  // Apply rounded corners to the QR code
  const roundedCorners = {
    borderRadius: "12px",
    overflow: "hidden",
  }

  return (
    <div style={roundedCorners} className="qr-code-container">
      <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-50 bg-opacity-80 p-2 rounded text-xs text-red-600">Data too large for QR code</div>
        </div>
      )}
    </div>
  )
}

export default UltraCompactQR

