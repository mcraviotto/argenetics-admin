import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Portal Argenetics - Recuperar contraseña",
  description: "Recupera tu contraseña de Argenetics",
};

export default function PasswordRecoveryLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 items-center min-w-[450px]">
        <Image src="/argenetics-logo.webp" width={200} height={30} alt="Argenetics" priority />
        {children}
      </div>
    </div>
  )
}