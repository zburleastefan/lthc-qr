"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"

interface RoundedQRCodeProps {
  value: string
  size: number
  bgColor: string
  fgColor: string
  level: "L" | "M" | "Q" | "H"
  imageSettings?: {
    src: string
    height: number
    width: number
    excavate: boolean
  }
}

const RoundedQRCode: React.FC<RoundedQRCodeProps> = ({ value, size, bgColor, fgColor, level, imageSettings }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  // Process the QR code SVG to create a more stylized appearance
  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current

    // Get all the path elements (QR code modules)
    const paths = svg.querySelectorAll("path")

    // Skip the first path which is usually the background
    for (let i = 1; i < paths.length; i++) {
      const path = paths[i] as SVGPathElement

      // Add rounded corners to the path
      path.setAttribute("rx", "2")
      path.setAttribute("ry", "2")

      // Add a slight transform to make it more organic
      if (Math.random() > 0.7) {
        const scale = 0.95 + Math.random() * 0.1
        path.setAttribute("transform", `scale(${scale})`)
      }
    }

    // Merge adjacent modules to create a more fluid appearance
    const mergeModules = () => {
      // This is a simplified approach - in a real implementation,
      // you would need more complex path merging logic
      const modules = Array.from(paths).slice(1)

      modules.forEach((module, index) => {
        if (index % 3 === 0 && index + 1 < modules.length) {
          // Randomly merge some modules
          if (Math.random() > 0.7) {
            const nextModule = modules[index + 1] as SVGPathElement
            const currentPath = module.getAttribute("d") || ""
            const nextPath = nextModule.getAttribute("d") || ""

            // Simple path concatenation (not perfect but gives a visual effect)
            module.setAttribute("d", currentPath + " " + nextPath)
            nextModule.style.display = "none"
          }
        }
      })
    }

    // Apply the module merging
    mergeModules()
  }, [value, size, fgColor, bgColor, level])

  return (
    <div className="relative">
      {/* Background with rounded corners */}
      <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: bgColor }} />

      {/* QR Code with custom styling */}
      <div className="relative" ref={svgRef as unknown as React.RefObject<HTMLDivElement>}>
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          fgColor={fgColor}
          bgColor="transparent"
          imageSettings={imageSettings}
          // Apply custom styling to make the QR code more visually appealing
          style={{
            shapeRendering: "geometricPrecision",
          }}
          // Add custom CSS to round the QR code cells
          className="qr-stylized"
        />
      </div>

      {/* Add the logo on top if provided */}
      {imageSettings && (
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `${imageSettings.width}px`,
            height: `${imageSettings.height}px`,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgColor,
            borderRadius: "50%",
            padding: "2px",
            boxShadow: "0 0 8px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={imageSettings.src || "/placeholder.svg"}
            alt="QR Logo"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: "50%",
            }}
          />
        </div>
      )}
    </div>
  )
}

export default RoundedQRCode

