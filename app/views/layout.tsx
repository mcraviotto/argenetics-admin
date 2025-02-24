'use client'

import Header from "@/components/header";
import Navbar from "@/components/navbar";

export default function ViewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full">
      <Header />
      <Navbar />
      <div className="p-6 flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  )
}