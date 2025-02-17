import Breadcrumb from "@/components/breadcumb";
import Header from "@/components/header";
import Navbar from "@/components/navbar";

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex flex-col w-full h-full">
      <Header />
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto flex flex-col w-full h-full">
        <div className="flex flex-col gap-4">
          <Breadcrumb />
          {children}
        </div>
      </div>
    </div>
  )
}