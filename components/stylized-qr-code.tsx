"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"

interface StylizedQRCodeProps {
  value: string
  size: number
  bgColor: string
  fgColor: string
  level: "L" | "M" | "Q" | "H"
  logoImage?: string
  logoSize?: number
}

const StylizedQRCode: React.FC<StylizedQRCodeProps> = ({
  value,
  size,
  bgColor,
  fgColor,
  level,
  logoImage,
  logoSize = 50,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!ref.current) return

    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: value,
        dotsOptions: {
          color: fgColor,
          type: "rounded",
        },
        cornersSquareOptions: {
          color: fgColor,
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: fgColor,
          type: "dot",
        },
        backgroundOptions: {
          color: bgColor,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
        },
        qrOptions: {
          errorCorrectionLevel: level,
        },
      })

      qrCode.current.append(ref.current)
    } else {
      qrCode.current.update({
        data: value,
        dotsOptions: {
          color: fgColor,
        },
        cornersSquareOptions: {
          color: fgColor,
        },
        cornersDotOptions: {
          color: fgColor,
        },
        backgroundOptions: {
          color: bgColor,
        },
        qrOptions: {
          errorCorrectionLevel: level,
        },
      })
    }

    // Update logo if provided
    if (logoImage) {
      qrCode.current.update({
        image: logoImage,
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: logoSize / 200,
          crossOrigin: "anonymous",
          margin: 10,
        },
      })
    } else {
      qrCode.current.update({
        image: undefined,
      })
    }
  }, [value, size, fgColor, bgColor, level, logoImage, logoSize])

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ width: size, height: size }}>
      <div ref={ref} className="qr-code-container" />
    </div>
  )
}

export default StylizedQRCode

