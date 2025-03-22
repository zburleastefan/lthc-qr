import QRCodeGenerator from "@/components/qr-code-generator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-10 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-indigo-300 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-purple-300 opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pink-300 opacity-5 blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <header className="text-center mb-10">
          <div className="inline-block mb-3">
            <div className="relative">
              <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 relative z-10">
                LTHC QR Code Generator
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-70"></div>
            </div>
          </div>
          <p className="text-indigo-700 opacity-80 text-lg max-w-2xl mx-auto">
            Create magical QR codes for your enchanted digital journey with our beautiful, modern generator
          </p>
        </header>
        <QRCodeGenerator />

        <footer className="mt-12 text-center text-sm text-indigo-500/70">
          <p>✨ Create beautiful, scannable QR codes for any purpose ✨</p>
        </footer>
      </div>
    </main>
  )
}

