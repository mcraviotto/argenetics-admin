import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Argenetics - Estamos procesando tu solicitud",
  description: "Estamos procesando tu solicitud",
}

export default function WaitingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-6 bg-muted p-4 sm:p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4 sm:gap-6 items-center">
        <div className="w-40 sm:w-48 md:w-52 h-auto relative">
          <Image
            src="/argenetics-logo.webp"
            width={200}
            height={30}
            alt="Argenetics"
            priority
            className="w-full h-auto"
          />
        </div>
        {children}
      </div>
    </div>
  )
}

