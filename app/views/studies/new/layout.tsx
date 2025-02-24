import Breadcrumb from "@/components/breadcumb";

export default function NewStudyLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb />
      {children}
    </div>
  )
}