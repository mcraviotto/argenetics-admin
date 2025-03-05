import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Portal Argenetics - Registrarse",
  description: "Registrarse en Argenetics para acceder a tu cuenta",
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 sm:gap-6 bg-muted p-4 sm:p-6 md:p-10">
      <div className="flex flex-col gap-4 sm:gap-6 items-center w-full max-w-4xl">
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