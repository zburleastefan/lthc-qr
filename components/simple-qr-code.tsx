"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import QRCode from "qrcode"

interface SimpleQRCodeProps {
  value: string
  size: number
  fgColor: string
  bgColor: string
  logoImage?: string
  logoSize?: number
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
}

const SimpleQRCode: React.FC<SimpleQRCodeProps> = ({
  value,
  size,
  fgColor,
  bgColor,
  logoImage,
  logoSize = 50,
  errorCorrectionLevel = "L",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentErrorLevel, setCurrentErrorLevel] = useState<"L" | "M" | "Q" | "H">(errorCorrectionLevel)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas and any previous errors
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)
    setError(null)

    // Try to generate QR code with current settings
    const generateQR = () => {
      QRCode.toCanvas(
        canvas,
        value,
        {
          width: size,
          margin: 1, // Minimal margin
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: currentErrorLevel,
          version: 40, // Use maximum version to allow more data
        },
        (err) => {
          if (err) {
            console.error("Error generating QR code:", err)
            setError(err.message)

            // If error is about data size and we're not already at the lowest level, try with lower error correction
            if (err.message.includes("too big") && currentErrorLevel !== "L") {
              setCurrentErrorLevel("L")
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
    }

    generateQR()
  }, [value, size, fgColor, bgColor, logoImage, logoSize, currentErrorLevel])

  // Apply rounded corners to the QR code
  const roundedCorners = {
    borderRadius: "12px",
    overflow: "hidden",
  }

  return (
    <div style={roundedCorners} className="qr-code-container">
      {error ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-red-50 p-4 text-center">
          <p className="text-red-500 text-xs mb-2">Error: QR code data too large</p>
          <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
        </div>
      ) : (
        <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
      )}
    </div>
  )
}

export default SimpleQRCode

