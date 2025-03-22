"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import QRCode from "qrcode"

interface PremiumQRCodeProps {
  value: string
  size: number
  fgColor: string
  bgColor: string
  logoImage?: string
  logoSize?: number
  scaleFactor?: number
}

const PremiumQRCode: React.FC<PremiumQRCodeProps> = ({
  value,
  size,
  fgColor,
  bgColor,
  logoImage,
  logoSize = 60,
  scaleFactor = 1,
}) => {
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

    // Generate a high-quality QR code
    const generateQR = async () => {
      try {
        // Generate QR code with optimal settings for scannability
        QRCode.toCanvas(canvas, value, {
          width: size,
          margin: 1, // Minimal margin for better scanning
          errorCorrectionLevel: "H", // High error correction for better scanning with logo
          color: {
            dark: fgColor,
            light: bgColor,
          },
          // Ensure crisp rendering
        })

        // Add logo if provided - IMPORTANT: Make sure logo doesn't cover too much of the QR code
        if (logoImage) {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = logoImage

          img.onload = () => {
            // Calculate logo position - make sure logo is not too large
            // Limit logo size to 20% of QR code size for better scanning
            const maxLogoSize = size * 0.2
            const actualLogoSize = Math.min(logoSize, maxLogoSize)

            const logoX = (size - actualLogoSize) / 2
            const logoY = (size - actualLogoSize) / 2

            // Create a clean background for the logo
            ctx.fillStyle = bgColor
            ctx.beginPath()
            ctx.arc(size / 2, size / 2, actualLogoSize / 2, 0, Math.PI * 2)
            ctx.fill()

            // Draw logo
            ctx.drawImage(img, logoX, logoY, actualLogoSize, actualLogoSize)
          }
        }
      } catch (err) {
        console.error("Error generating QR code:", err)
        setError(err instanceof Error ? err.message : "Failed to generate QR code")
      }
    }

    generateQR()
  }, [value, size, fgColor, bgColor, logoImage, logoSize, scaleFactor])

  // Apply rounded corners to the QR code
  const roundedCorners = {
    borderRadius: "12px",
    overflow: "hidden",
  }

  return (
    <div style={roundedCorners} className="qr-code-container relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ display: "block" }}
        className="transition-all duration-300"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-50 bg-opacity-80 p-2 rounded text-xs text-red-600">{error}</div>
        </div>
      )}
    </div>
  )
}

export default PremiumQRCode

