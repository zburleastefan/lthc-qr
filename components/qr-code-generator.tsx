"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  ChevronLeft,
  Download,
  Sparkles,
  Link,
  FileText,
  ListOrdered,
  FolderClosed,
  Contact,
  Share2,
  FileCode,
  AppWindow,
  Info,
  Wand2,
  Upload,
  X,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { jsPDF } from "jspdf"
import { motion, AnimatePresence } from "framer-motion"
import PremiumQRCode from "./premium-qr-code"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type QRCodeType = "URL" | "PDF" | "Multi-URL" | "File" | "Contact" | "Socials" | "Plain Text" | "App"
type StepType = 1 | 2 | 3
type DotType = "square" | "rounded" | "dots" | "premium"
type QRQuality = "standard" | "high" | "premium"

export default function QRCodeGenerator() {
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [selectedType, setSelectedType] = useState<QRCodeType>("URL")
  const [qrData, setQrData] = useState({
    url: "https://coandatl.ro",
    androidUrl: "https://drive.google.com/file/d/1OupM_dmC4uH2FMGD9qbBAUADynZ7pMFI/view?usp=drive_link",
    iosUrl: "https://eu.jotform.com/app/250524050221338",
    otherUrl: "https://eu.jotform.com/app/250524050221338",
    plainText: "Hello, this is a QR code!",
  })
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false)
  const [qrColor, setQrColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [magicEffect, setMagicEffect] = useState(false)
  const [logoImage, setLogoImage] = useState<string | null>(null)

  const [logoSize, setLogoSize] = useState(500) // More reasonable default size
  const [dotType, setDotType] = useState<DotType>("square") // Default to square for better scanning
  const [qrQuality, setQrQuality] = useState<QRQuality>("high") // Default to high
  const qrRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate QR code on component mount
  useEffect(() => {
    setQrCodeGenerated(true)
  }, [])

  // Magic effect animation
  useEffect(() => {
    if (magicEffect) {
      const timer = setTimeout(() => {
        setMagicEffect(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [magicEffect])

  const handleTypeSelect = (type: QRCodeType) => {
    setSelectedType(type)
    setQrCodeGenerated(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setQrData((prev) => ({ ...prev, [name]: value }))
  }

  // Fixed Next button handler
  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2)
      setQrCodeGenerated(true)
      setMagicEffect(true)
    } else if (currentStep === 2) {
      setCurrentStep(3)
      setQrCodeGenerated(true)
      setMagicEffect(true)
    } else if (currentStep === 3) {
      downloadQRCode("png")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepType)
    }
  }

  // Function to create a shorter representation of URLs
  const shortenUrl = (url: string, maxLength = 100): string => {
    // Remove protocol (http:// or https://)
    //let shortened = url.replace(/^https?:\/\//, "")

    // Remove www. if present
    const shortened = url.replace(/^www\./, "")

    return shortened
  }

  // Get the QR code value - now using a shorter URL format
  const getQRCodeValue = () => {
    switch (selectedType) {
      case "URL":
        return qrData.url || "https://example.com"
      case "App":
        // Create a shorter URL by using minimal parameters and shortened URLs
        const android = encodeURIComponent(shortenUrl(qrData.androidUrl, 50))
        const ios = encodeURIComponent(shortenUrl(qrData.iosUrl, 50))

        return `${window.location.origin}/redirect?a=${android}&i=${ios}`
      case "Plain Text":
        return qrData.plainText || "Example text"
      default:
        return "https://example.com"
    }
  }

  // Add a function to display a more readable version of the QR code content
  const getDisplayQRCodeValue = () => {
    if (selectedType === "App") {
      return `Platform detection: Android → ${qrData.androidUrl.substring(0, 30)}..., iOS → ${qrData.iosUrl.substring(0, 30)}...`
    }
    return getQRCodeValue().length > 50 ? getQRCodeValue().substring(0, 50) + "..." : getQRCodeValue()
  }

  // Modify the downloadQRCode function to ensure the QR code is visible
  const downloadQRCode = (format: "png" | "svg" | "pdf") => {
    if (!qrRef.current) return

    setMagicEffect(true)

    if (format === "png") {
      // Create a high-resolution canvas for better quality
      const canvas = document.createElement("canvas")
      const size = 8000 // Much larger size for print quality
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Draw background with rounded corners
        ctx.fillStyle = bgColor
        ctx.beginPath()
        const cornerRadius = 60 // Rounded corner radius
        ctx.moveTo(cornerRadius, 0)
        ctx.lineTo(size - cornerRadius, 0)
        ctx.quadraticCurveTo(size, 0, size, cornerRadius)
        ctx.lineTo(size, size - cornerRadius)
        ctx.quadraticCurveTo(size, size, size - cornerRadius, size)
        ctx.lineTo(cornerRadius, size)
        ctx.quadraticCurveTo(0, size, 0, size - cornerRadius)
        ctx.lineTo(0, cornerRadius)
        ctx.quadraticCurveTo(0, 0, cornerRadius, 0)
        ctx.closePath()
        ctx.fill()

        // Get the QR code canvas
        const qrCanvas = qrRef.current.querySelector("canvas")
        if (qrCanvas) {
          // Use crisp image rendering - critical for QR codes
          ctx.imageSmoothingEnabled = false

          // Draw QR code at full resolution
          ctx.drawImage(qrCanvas, 0, 0, size, size)

          // If there's a logo, redraw it at high resolution
          if (logoImage) {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = logoImage

            img.onload = () => {
              // Calculate logo position for high-res canvas - limit logo size
              const maxLogoSize = size * 0.2 // Limit to 20% of QR code size
              const highResLogoSize = Math.min(logoSize * (size / 200), maxLogoSize)
              const logoX = (size - highResLogoSize) / 2
              const logoY = (size - highResLogoSize) / 2

              // Create a clean background for the logo
              ctx.fillStyle = bgColor
              ctx.beginPath()
              ctx.arc(size / 2, size / 2, highResLogoSize / 2, 0, Math.PI * 2)
              ctx.fill()

              // Draw logo at high resolution
              ctx.drawImage(img, logoX, logoY, highResLogoSize, highResLogoSize)

              // Now download the image with logo
              downloadFinalImage()
            }
          } else {
            // Download immediately if no logo
            downloadFinalImage()
          }

          function downloadFinalImage() {
            // Download the image at maximum quality
            const pngUrl = canvas.toDataURL("image/png", 1.0)
            const downloadLink = document.createElement("a")
            downloadLink.href = pngUrl
            downloadLink.download = "lthc-qr-code.png"
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
          }
        }
      }
    } else if (format === "svg") {
      // For SVG, we'll create a high-quality vector version
      const qrCanvas = qrRef.current.querySelector("canvas")
      if (qrCanvas) {
        // Create a temporary high-res canvas to get pixel data
        const tempCanvas = document.createElement("canvas")
        const tempSize = 1000
        tempCanvas.width = tempSize
        tempCanvas.height = tempSize
        const tempCtx = tempCanvas.getContext("2d")

        if (tempCtx) {
          // Draw QR code to temp canvas
          tempCtx.imageSmoothingEnabled = false
          tempCtx.drawImage(qrCanvas, 0, 0, tempSize, tempSize)

          // Get pixel data
          const imageData = tempCtx.getImageData(0, 0, tempSize, tempSize)
          const data = imageData.data

          // Create SVG
          const svgNS = "http://www.w3.org/2000/svg"
          const svg = document.createElementNS(svgNS, "svg")
          svg.setAttribute("width", "8000")
          svg.setAttribute("height", "8000")
          svg.setAttribute("viewBox", "0 0 1000 1000")
          svg.setAttribute("shape-rendering", "crispEdges") // Ensure crisp rendering

          // Add background rect with rounded corners
          const rect = document.createElementNS(svgNS, "rect")
          rect.setAttribute("width", "1000")
          rect.setAttribute("height", "1000")
          rect.setAttribute("rx", "15")
          rect.setAttribute("ry", "15")
          rect.setAttribute("fill", bgColor)
          svg.appendChild(rect)

          // Calculate module size
          const moduleSize = Math.ceil(tempSize / 40) // Estimate module size

          // Create SVG elements for each QR code module
          for (let y = 0; y < tempSize; y += moduleSize) {
            for (let x = 0; x < tempSize; x += moduleSize) {
              // Sample the center of each module
              const centerX = Math.min(x + Math.floor(moduleSize / 2), tempSize - 1)
              const centerY = Math.min(y + Math.floor(moduleSize / 2), tempSize - 1)
              const idx = (centerY * tempSize + centerX) * 4

              // If pixel is dark (part of QR code)
              if (data[idx] < 128) {
                const rect = document.createElementNS(svgNS, "rect")
                rect.setAttribute("x", String(x))
                rect.setAttribute("y", String(y))
                rect.setAttribute("width", String(moduleSize))
                rect.setAttribute("height", String(moduleSize))
                rect.setAttribute("fill", qrColor)
                svg.appendChild(rect)
              }
            }
          }

          // Add logo if present - with size limits
          if (logoImage) {
            // Create a circle for logo background
            const circle = document.createElementNS(svgNS, "circle")
            const maxLogoSize = tempSize * 0.2 // Limit to 20% of QR code size
            const logoSizeScaled = Math.min(logoSize * (tempSize / 200), maxLogoSize)
            circle.setAttribute("cx", String(tempSize / 2))
            circle.setAttribute("cy", String(tempSize / 2))
            circle.setAttribute("r", String(logoSizeScaled / 2))
            circle.setAttribute("fill", bgColor)
            svg.appendChild(circle)

            // Add logo as image
            const img = document.createElementNS(svgNS, "image")
            img.setAttribute("x", String((tempSize - logoSizeScaled) / 2))
            img.setAttribute("y", String((tempSize - logoSizeScaled) / 2))
            img.setAttribute("width", String(logoSizeScaled))
            img.setAttribute("height", String(logoSizeScaled))
            img.setAttribute("href", logoImage)
            img.setAttribute("preserveAspectRatio", "xMidYMid meet")
            svg.appendChild(img)
          }

          // Convert SVG to string and download
          const svgData = new XMLSerializer().serializeToString(svg)
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
          const svgUrl = URL.createObjectURL(svgBlob)
          const downloadLink = document.createElement("a")
          downloadLink.href = svgUrl
          downloadLink.download = "lthc-qr-code.svg"
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
          URL.revokeObjectURL(svgUrl)
        }
      }
    } else if (format === "pdf") {
      // Create a high-resolution canvas for the PDF
      const canvas = document.createElement("canvas")
      const size = 8000 // Larger size for better quality
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Draw background with rounded corners
        ctx.fillStyle = bgColor
        ctx.beginPath()
        const cornerRadius = 60 // Rounded corner radius
        ctx.moveTo(cornerRadius, 0)
        ctx.lineTo(size - cornerRadius, 0)
        ctx.quadraticCurveTo(size, 0, size, cornerRadius)
        ctx.lineTo(size, size - cornerRadius)
        ctx.quadraticCurveTo(size, size, size - cornerRadius, size)
        ctx.lineTo(cornerRadius, size)
        ctx.quadraticCurveTo(0, size, 0, size - cornerRadius)
        ctx.lineTo(0, cornerRadius)
        ctx.quadraticCurveTo(0, 0, cornerRadius, 0)
        ctx.closePath()
        ctx.fill()

        // Get the QR code canvas
        const qrCanvas = qrRef.current.querySelector("canvas")
        if (qrCanvas) {
          // Use crisp image rendering
          ctx.imageSmoothingEnabled = false

          // Draw QR code
          ctx.drawImage(qrCanvas, 0, 0, size, size)

          // If there's a logo, redraw it at high resolution
          if (logoImage) {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = logoImage

            img.onload = () => {
              // Calculate logo position for high-res canvas - limit logo size
              const maxLogoSize = size * 0.2 // Limit to 20% of QR code size
              const highResLogoSize = Math.min(logoSize * (size / 200), maxLogoSize)
              const logoX = (size - highResLogoSize) / 2
              const logoY = (size - highResLogoSize) / 2

              // Create a clean background for the logo
              ctx.fillStyle = bgColor
              ctx.beginPath()
              ctx.arc(size / 2, size / 2, highResLogoSize / 2, 0, Math.PI * 2)
              ctx.fill()

              // Draw logo at high resolution
              ctx.drawImage(img, logoX, logoY, highResLogoSize, highResLogoSize)

              // Now create the PDF with the logo
              createAndDownloadPDF()
            }
          } else {
            // Create PDF immediately if no logo
            createAndDownloadPDF()
          }

          function createAndDownloadPDF() {
            // Create PDF with high quality
            const imgData = canvas.toDataURL("image/png", 1.0)
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
              compress: false, // Avoid compression for better quality
            })

            // Add a title
            pdf.setFontSize(20)
            pdf.text("LTHC QR Code", 105, 20, { align: "center" })

            // Add the QR code at high quality
            const imgWidth = 180 // Larger size for better print quality
            const imgHeight = 180
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const x = (pageWidth - imgWidth) / 2
            const y = (pageHeight - imgHeight) / 2 - 10 // Adjust position to account for title

            pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST")

            // Add footer with QR data
            pdf.setFontSize(10)
            pdf.text(`QR Code Type: ${selectedType}`, 105, pageHeight - 20, { align: "center" })
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, pageHeight - 15, { align: "center" })

            pdf.save("lthc-qr-code.pdf")
          }
        }
      }
    }
  }

  // Render the appropriate QR code component based on quality setting
  const renderQRCode = () => {
    return (
      <div className="scale-[0.85]">
        <PremiumQRCode
          value={getQRCodeValue()}
          size={300} // Larger preview size
          fgColor={qrColor}
          bgColor={bgColor}
          logoImage={logoImage || undefined}
          logoSize={Math.min(logoSize / 5, 60)} // Limit logo size for better scanning
          scaleFactor={2} // Higher quality rendering
        />
      </div>
    )
  }

  // Remove the isNextDisabled function's check for otherUrl
  const isNextDisabled = () => {
    if (currentStep === 2) {
      if (selectedType === "URL") {
        return !qrData.url
      }
      if (selectedType === "App") {
        return !qrData.androidUrl || !qrData.iosUrl // Now require both Android and iOS URLs
      }
      if (selectedType === "Plain Text") {
        return !qrData.plainText
      }
    }
    return false
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset the file input
    }
  }

  // Predefined color schemes
  const colorSchemes = [
    { name: "Classic", fg: "#000000", bg: "#FFFFFF" },
    { name: "Neon", fg: "#00FFDD", bg: "#0D0221" },
    { name: "Sunset", fg: "#FF5E5B", bg: "#FFFFEA" },
    { name: "Forest", fg: "#2D4739", bg: "#E8F3D6" },
    { name: "Ocean", fg: "#1A5F7A", bg: "#EEF3FF" },
    { name: "Midnight", fg: "#6C63FF", bg: "#1E1E2C" },
  ]

  return (
    <div className="relative min-h-[600px] border rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-8 h-8 rounded-full bg-purple-300 opacity-20 animate-pulse"></div>
        <div
          className="absolute top-20 right-20 w-6 h-6 rounded-full bg-blue-300 opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-10 h-10 rounded-full bg-pink-300 opacity-20 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-4 h-4 rounded-full bg-yellow-300 opacity-20 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5"></div>
      </div>

      {/* Steps navigation with enhanced styling */}
      <div className="relative z-10 flex items-center justify-center p-6 border-b backdrop-blur-sm bg-white/50">
        <div className="flex items-center w-full max-w-2xl">
          <div className="flex items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shadow-md transition-all duration-300",
                currentStep >= 1
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-400",
              )}
            >
              1
            </div>
            <div className="ml-2 text-sm font-medium text-gray-700">Select Type</div>
            <div className="flex-1 h-px mx-4 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
          </div>

          <div className="flex items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shadow-md transition-all duration-300",
                currentStep >= 2
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-400",
              )}
            >
              2
            </div>
            <div className="ml-2 text-sm font-medium text-gray-700">Customize</div>
            <div className="flex-1 h-px mx-4 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
          </div>

          <div className="flex items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shadow-md transition-all duration-300",
                currentStep >= 3
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-400",
              )}
            >
              3
            </div>
            <div className="ml-2 text-sm font-medium text-gray-700">Download</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6 p-6">
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="border rounded-xl overflow-hidden shadow-md bg-white/80 backdrop-blur-sm"
              >
                <div className="p-4">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4">Select QR Code Type</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { type: "URL", icon: <Link size={24} />, description: "Website or link" },
                      { type: "Plain Text", icon: <FileCode size={24} />, description: "Text message" },
                      { type: "App", icon: <AppWindow size={24} />, description: "App download" },
                      { type: "Contact", icon: <Contact size={24} />, description: "Contact info" },
                      { type: "File", icon: <FolderClosed size={24} />, description: "File download" },
                      { type: "PDF", icon: <FileText size={24} />, description: "PDF document" },
                      { type: "Multi-URL", icon: <ListOrdered size={24} />, description: "Multiple links" },
                      { type: "Socials", icon: <Share2 size={24} />, description: "Social media" },
                    ].map((item, index) => (
                      <button
                        key={index}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 h-full",
                          selectedType === item.type
                            ? "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 shadow-md border border-indigo-200"
                            : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100",
                        )}
                        onClick={() => handleTypeSelect(item.type as QRCodeType)}
                      >
                        <div className="mb-2 p-2 bg-indigo-50 rounded-full">{item.icon}</div>
                        <span className="text-sm font-medium text-center">{item.type}</span>
                        <span className="text-xs text-gray-500 mt-1 text-center">{item.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="border rounded-xl p-6 shadow-md bg-white/80 backdrop-blur-sm"
              >
                {selectedType === "URL" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-800">Enter URL</h3>
                    <div className="relative">
                      <Input
                        name="url"
                        value={qrData.url}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                        className="pl-10 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300"
                      />
                      <Link className="absolute left-3 top-2.5 h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                )}

                {selectedType === "Plain Text" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-800">Enter Plain Text</h3>
                    <div className="relative">
                      <Input
                        name="plainText"
                        value={qrData.plainText}
                        onChange={handleInputChange}
                        placeholder="Enter your text here"
                        className="pl-10 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300"
                      />
                      <FileCode className="absolute left-3 top-2.5 h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                )}

                {selectedType === "App" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-indigo-800">
                      Redirect to app download based on the device OS
                    </h3>
                    <div className="text-sm p-3 bg-indigo-50 rounded-md text-indigo-700 mb-4">
                      <p className="flex items-start">
                        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        This QR code will automatically detect the user's device and redirect to the appropriate app
                        store or website. When scanned, it will send Android users to the Android URL and iOS users to
                        the iOS URL.
                      </p>
                    </div>
                    <div className="text-sm p-3 bg-amber-50 rounded-md text-amber-700 mb-4">
                      <p className="flex items-start">
                        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        For best results, keep URLs as short as possible. Long URLs may cause QR code generation errors.
                      </p>
                    </div>
                    <p className="text-sm text-pink-500">* Both fields are required</p>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-700">
                        URL for Android <span className="text-pink-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          name="androidUrl"
                          value={qrData.androidUrl}
                          onChange={handleInputChange}
                          placeholder="e.g. https://play.google.com/store/apps/details?id=com.google.android.apps.maps"
                          className="pl-10 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300"
                          required
                        />
                        <AppWindow className="absolute left-3 top-2.5 h-5 w-5 text-indigo-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-indigo-700">
                        URL for iOS <span className="text-pink-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          name="iosUrl"
                          value={qrData.iosUrl}
                          onChange={handleInputChange}
                          placeholder="e.g. https://apps.apple.com/us/app/google-maps/id585027354"
                          className="pl-10 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300"
                          required
                        />
                        <AppWindow className="absolute left-3 top-2.5 h-5 w-5 text-indigo-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Style Customization */}
                <div className="mt-8 pt-6 border-t border-indigo-100">
                  <div className="space-y-6">
                    <h4 className="text-md font-medium text-indigo-800 flex items-center">
                      <Palette className="mr-2 h-5 w-5" />
                      Style Your QR Code
                    </h4>

                    <Tabs defaultValue="colors" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="colors">Colors</TabsTrigger>
                        <TabsTrigger value="logo">Logo</TabsTrigger>
                      </TabsList>

                      <TabsContent value="colors" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-indigo-700 block mb-2">QR Code Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={qrColor}
                                onChange={(e) => setQrColor(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer"
                              />
                              <span className="text-sm text-gray-600">{qrColor}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-indigo-700 block mb-2">Background Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer"
                              />
                              <span className="text-sm text-gray-600">{bgColor}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="text-sm font-medium text-indigo-700 block mb-2">Color Schemes</label>
                          <div className="grid grid-cols-3 gap-2">
                            {colorSchemes.map((scheme, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setQrColor(scheme.fg)
                                  setBgColor(scheme.bg)
                                }}
                                className="p-2 border rounded-md hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-center items-center mb-1">
                                  <div
                                    className="w-6 h-6 rounded-full mr-1"
                                    style={{ backgroundColor: scheme.fg }}
                                  ></div>
                                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.bg }}></div>
                                </div>
                                <p className="text-xs text-center">{scheme.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="logo" className="space-y-4 pt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="logo-upload"
                              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md cursor-pointer hover:bg-indigo-100 transition-colors"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              <span>Upload Logo</span>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoUpload}
                                ref={fileInputRef}
                              />
                            </label>

                            {logoImage && (
                              <button
                                onClick={removeLogo}
                                className="flex items-center px-3 py-1 text-red-600 rounded-md hover:bg-red-50"
                              >
                                <X className="mr-1 h-4 w-4" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>

                          {logoImage && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 border rounded-md overflow-hidden flex items-center justify-center bg-white">
                                  <img
                                    src={logoImage || "/placeholder.svg"}
                                    alt="Logo"
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-sm font-medium text-indigo-700 block mb-2">
                                    Logo Size: {logoSize}px
                                  </label>
                                  <input
                                    type="range"
                                    min="50"
                                    max="500"
                                    value={logoSize}
                                    onChange={(e) => setLogoSize(Number.parseInt(e.target.value))}
                                    className="w-full"
                                  />
                                </div>
                              </div>

                              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-start">
                                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <p>
                                  Adding a logo may reduce the QR code's readability. Keep the logo simple for best
                                  results.
                                </p>
                              </div>
                            </div>
                          )}

                          {!logoImage && (
                            <div className="text-sm text-gray-500 p-4 border border-dashed border-gray-300 rounded-md text-center">
                              <p>Upload a logo to place in the center of your QR code</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="border rounded-xl p-6 shadow-md bg-white/80 backdrop-blur-sm"
              >
                <h3 className="text-xl font-medium mb-6 text-center text-indigo-800">Download Your Magical QR Code</h3>
                <div className="space-y-4">
                  <Button
                    onClick={() => downloadQRCode("png")}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => downloadQRCode("svg")}
                    variant="outline"
                    className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download SVG
                  </Button>
                  <Button
                    onClick={() => downloadQRCode("pdf")}
                    variant="outline"
                    className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                </div>

                <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="text-md font-medium text-indigo-800 mb-2">QR Code Information</h4>

                  <div className="text-sm text-indigo-700 space-y-1">
                    <p>
                      <span className="font-medium">Type:</span> {selectedType}
                    </p>
                    <p>
                      <span className="font-medium">Content:</span> {getDisplayQRCodeValue()}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span> {new Date().toLocaleString()}
                    </p>
                    {logoImage && (
                      <p>
                        <span className="font-medium">Logo:</span> Added
                      </p>
                    )}
                    {selectedType === "App" && (
                      <div className="mt-2 p-2 bg-indigo-100 rounded text-xs">
                        <p className="font-medium text-indigo-800">Platform Detection:</p>
                        <p>• Android devices will be redirected to: {qrData.androidUrl}</p>
                        <p>• iOS devices will be redirected to: {qrData.iosUrl}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-2">
          <div className="border rounded-xl p-6 shadow-md flex flex-col items-center justify-center space-y-6 bg-white/80 backdrop-blur-sm relative overflow-hidden">
            {/* Enhanced frame with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
            <div className="absolute inset-0 border-8 border-indigo-100/50 rounded-xl pointer-events-none"></div>

            {/* QR Code display will go here */}
            {/* QR Code display */}
            <div
              ref={qrRef}
              className={cn(
                "w-48 h-48 flex items-center justify-center bg-white rounded-xl shadow-md relative overflow-hidden transition-all duration-500 qr-code-container",
                magicEffect && "ring-4 ring-purple-300 ring-opacity-50",
              )}
              style={{ maxWidth: "100%" }}
            >
              {qrCodeGenerated ? (
                <>
                  <div className="w-full h-full flex items-center justify-center">{renderQRCode()}</div>

                  {/* Magic effect */}
                  {magicEffect && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 bg-purple-300/20 rounded-full z-20"
                    />
                  )}

                  {/* Sparkles */}
                  {magicEffect && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="absolute top-2 right-2 text-yellow-400"
                      >
                        <Sparkles size={16} />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="absolute bottom-2 left-2 text-purple-400"
                      >
                        <Sparkles size={16} />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="absolute top-2 left-10 text-indigo-400"
                      >
                        <Sparkles size={16} />
                      </motion.div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-36 h-36 bg-gray-200 opacity-30 rounded-lg"></div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) {
                  setCurrentStep(2)
                } else if (currentStep === 2) {
                  setCurrentStep(3)
                } else if (currentStep === 3) {
                  downloadQRCode("png")
                }
                setQrCodeGenerated(true)
                setMagicEffect(true)
              }}
              disabled={isNextDisabled()}
              className={cn(
                "w-full h-10 rounded-md font-medium transition-all duration-300 shadow-md relative overflow-hidden group",
                currentStep < 3
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white",
                isNextDisabled()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-[0_0_15px_rgba(129,140,248,0.8)] hover:scale-[1.02]",
              )}
            >
              {/* Enhanced button effects */}
              <span className="absolute inset-0 w-full h-full bg-white/30 scale-0 rounded-md filter blur-md group-hover:scale-110 transition-transform duration-300 origin-center"></span>
              <span className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></span>
              <span
                className="absolute top-0 right-1/4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                style={{ animationDelay: "0.3s" }}
              ></span>
              <span
                className="absolute bottom-0 left-1/3 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></span>
              <span className="relative z-10 flex items-center justify-center">
                {currentStep < 3 ? "Next" : "Finish"}
              </span>
            </button>

            {currentStep === 1 && (
              <div className="flex items-start p-4 bg-indigo-50 text-indigo-700 rounded-md text-sm border border-indigo-100">
                <Wand2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>Select a QR code type to begin your magical journey!</div>
              </div>
            )}

            {currentStep === 2 && !qrCodeGenerated && (
              <div className="flex items-start p-4 bg-indigo-50 text-indigo-700 rounded-md text-sm border border-indigo-100">
                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>Your QR Code isn't ready yet. Add content and click Next to generate it.</div>
              </div>
            )}

            {currentStep === 2 && qrCodeGenerated && (
              <div className="flex items-start p-4 bg-indigo-50 text-indigo-700 rounded-md text-sm border border-indigo-100">
                <Sparkles className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>Your magical QR code is ready! Click Next to download.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      {currentStep > 1 && (
        <div className="absolute bottom-6 left-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  )
}

