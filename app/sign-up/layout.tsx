import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Argenetics - Registrarse",
  description: "Registrarse en Argenetics para acceder a tu cuenta",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex flex-col gap-6 items-center min-w-[450px]">
        <Image src="/argenetics-logo.webp" width={200} height={30} alt="Argenetics" priority />
        {children}
      </div>
    </div>
  )
}