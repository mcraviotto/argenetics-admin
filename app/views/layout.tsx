'use client'

import Header from "@/components/header";
import Navbar from "@/components/navbar";

export default function ViewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <Navbar />
      <div className="p-2 sm:p-4 md:p-6 flex flex-col w-full flex-grow">{children}</div>
    </div>
  )
}