"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function RedirectPage() {
  const searchParams = useSearchParams()
  const androidUrl = searchParams.get("android") || searchParams.get("a")
  const iosUrl = searchParams.get("ios") || searchParams.get("i")

  // Decode URLs
  const decodedAndroidUrl = androidUrl ? decodeURIComponent(androidUrl) : ""
  const decodedIosUrl = iosUrl ? decodeURIComponent(iosUrl) : ""

  const [error, setError] = useState("")

  useEffect(() => {
    if (!decodedAndroidUrl || !decodedIosUrl) {
      setError("Missing redirect URLs")
      return
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    let targetUrl = decodedAndroidUrl // Default to Android as fallback

    if (/android/i.test(userAgent)) {
      targetUrl = decodedAndroidUrl
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      targetUrl = decodedIosUrl
    }
    //targetUrl = "https://"+ targetUrl;

    // Ensure URL is absolute
    if (!targetUrl.startsWith("http")) {
      console.error("Invalid redirect URL:", targetUrl)
      setError("Invalid redirect URL")
      return
    }

    setTimeout(() => {
      window.location.assign(targetUrl)
      //window.location.href = targetUrl; // ✅ Avoids popup blocking
    }, 2000)
  }, [decodedAndroidUrl, decodedIosUrl])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      {error ? (
        <div className="text-red-600 font-medium">{error}</div>
      ) : (
        <>
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-medium">Redirecting, please wait...</p>

          {/* Show decoded URLs for debugging */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Android URL: {androidUrl || "Not provided"}</p>
            <p>iOS URL: {iosUrl || "Not provided"}</p>
          </div>
        </>
      )}
    </div>
  )
}

