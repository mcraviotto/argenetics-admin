import Breadcrumb from "@/components/breadcumb"
import Header from "@/components/header"
import Navbar from "@/components/navbar"
import React from "react"
import DeleteClientStudyDialog from "./[user_id]/components/delete-client-study-dialog"
import DeleteClientDialog from "./components/delete-client-dialog"

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full">
      <Header />
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto flex flex-col w-full h-full">
        <div className="flex flex-col gap-4">
          <Breadcrumb />
          {children}
          <DeleteClientStudyDialog />
          <DeleteClientDialog />
        </div>
      </div>
    </div>
  )
}

