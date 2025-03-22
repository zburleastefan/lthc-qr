"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import QRCode from "qrcode"

interface FuturisticQRCodeProps {
  value: string
  size: number
  fgColor: string
  bgColor: string
  logoImage?: string
  logoSize?: number
  dotType?: "square" | "rounded" | "dots"
}

const FuturisticQRCode: React.FC<FuturisticQRCodeProps> = ({
  value,
  size,
  fgColor,
  bgColor,
  logoImage,
  logoSize = 60,
  dotType = "rounded",
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

    // Simplify the URL to reduce QR code complexity
    let processedValue = value
    if (value.startsWith("http")) {
      // Remove protocol and www
      processedValue = value.replace(/^https?:\/\/(www\.)?/, "")
      // Remove trailing slashes
      processedValue = processedValue.replace(/\/+$/, "")
    }

    // Generate minimal QR code
    QRCode.toDataURL(
      processedValue,
      {
        errorCorrectionLevel: "L",
        margin: 0,
        width: size,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (err, url) => {
        if (err) {
          console.error("Error generating QR code:", err)
          setError(err.message)
          return
        }

        // Load the QR code image
        const qrImage = new Image()
        qrImage.crossOrigin = "anonymous"
        qrImage.src = url

        qrImage.onload = () => {
          // Clear canvas
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, size, size)

          // Draw the QR code
          ctx.drawImage(qrImage, 0, 0, size, size)

          // Get the QR code data
          const imageData = ctx.getImageData(0, 0, size, size)
          const data = imageData.data

          // Clear canvas again
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, size, size)

          // Calculate module size (QR code is typically 25x25, 29x29, 33x33, etc.)
          const moduleEstimate = Math.floor(Math.sqrt((size * size) / 625)) // Estimate module size
          const moduleSize = Math.max(moduleEstimate, 4) // Ensure minimum size

          // Draw stylized QR code
          for (let y = 0; y < size; y += moduleSize) {
            for (let x = 0; x < size; x += moduleSize) {
              // Sample the center of each module
              const centerX = Math.min(x + Math.floor(moduleSize / 2), size - 1)
              const centerY = Math.min(y + Math.floor(moduleSize / 2), size - 1)
              const idx = (centerY * size + centerX) * 4

              // If pixel is dark (part of QR code)
              if (data[idx] < 128) {
                ctx.fillStyle = fgColor

                // Calculate position and size with a small gap
                const gap = moduleSize * 0.15
                const dotSize = moduleSize - gap * 2
                const dotX = x + gap
                const dotY = y + gap

                // Draw different dot shapes based on dotType
                if (dotType === "square") {
                  ctx.fillRect(dotX, dotY, dotSize, dotSize)
                } else if (dotType === "rounded") {
                  ctx.beginPath()
                  ctx.roundRect(dotX, dotY, dotSize, dotSize, [moduleSize * 0.3])
                  ctx.fill()
                } else if (dotType === "dots") {
                  ctx.beginPath()
                  ctx.arc(x + moduleSize / 2, y + moduleSize / 2, dotSize / 2, 0, Math.PI * 2)
                  ctx.fill()
                }
              }
            }
          }

          // Draw special positioning squares (the three corners)
          const positionSize = moduleSize * 7
          const positions = [
            { x: 0, y: 0 }, // Top-left
            { x: size - positionSize, y: 0 }, // Top-right
            { x: 0, y: size - positionSize }, // Bottom-left
          ]

          positions.forEach((pos) => {
            // Outer square
            ctx.fillStyle = fgColor
            if (dotType === "rounded") {
              ctx.beginPath()
              ctx.roundRect(pos.x, pos.y, positionSize, positionSize, [moduleSize * 0.8])
              ctx.fill()
            } else {
              ctx.fillRect(pos.x, pos.y, positionSize, positionSize)
            }

            // Inner white square
            ctx.fillStyle = bgColor
            const innerPos = moduleSize
            const innerSize = positionSize - moduleSize * 2
            if (dotType === "rounded") {
              ctx.beginPath()
              ctx.roundRect(pos.x + innerPos, pos.y + innerPos, innerSize, innerSize, [moduleSize * 0.4])
              ctx.fill()
            } else {
              ctx.fillRect(pos.x + innerPos, pos.y + innerPos, innerSize, innerSize)
            }

            // Center square
            ctx.fillStyle = fgColor
            const centerPos = moduleSize * 2
            const centerSize = positionSize - moduleSize * 4
            if (dotType === "rounded") {
              ctx.beginPath()
              ctx.roundRect(pos.x + centerPos, pos.y + centerPos, centerSize, centerSize, [moduleSize * 0.2])
              ctx.fill()
            } else {
              ctx.fillRect(pos.x + centerPos, pos.y + centerPos, centerSize, centerSize)
            }
          })

          // Add logo if provided
          if (logoImage) {
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
        }
      },
    )
  }, [value, size, fgColor, bgColor, logoImage, logoSize, dotType])

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
          <div className="bg-red-50 bg-opacity-80 p-2 rounded text-xs text-red-600">QR code data too large</div>
        </div>
      )}
    </div>
  )
}

export default FuturisticQRCode

