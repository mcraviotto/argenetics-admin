'use client'

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Hospital, Stethoscope, User } from "lucide-react"
import { useTransitionRouter } from "next-view-transitions"
import { usePathname } from "next/navigation"

const tabs = [
  {
    id: "views/doctors",
    label: "Médicos",
    icon: Stethoscope
  },
  {
    id: "views/medical-institutions",
    label: "Centros médicos",
    icon: Hospital
  },
  {
    id: "views/patients",
    label: "Pacientes",
    icon: User
  },
  {
    id: "views/studies",
    label: "Estudios",
    icon: FileText
  }
]

export default function Navbar() {
  const router = useTransitionRouter()
  const pathname = usePathname()

  const activeTab = tabs.find((tab) => pathname.includes(tab.id))?.id || tabs[0].id
  return (
    <Tabs value={activeTab} className="px-6 border-b border-border shadow-sm relative z-10 bg-background flex items-center">
      <TabsList className="gap-2 bg-transparent py-2">
        {tabs.map((tab) => (
          <TabsTrigger
            value={tab.id}
            key={tab.id}
            asChild
          >
            <Button
              variant="ghost"
              size="sm"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:shadow-primary/50 hover:bg-accent"
              onClick={() => router.push(`/${tab.id}`)}
            >
              {tab.icon && <tab.icon size={16} className="-ms-0.5 me-1.5 opacity-80" aria-hidden strokeWidth={2} />}
              {tab.label}
            </Button>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}