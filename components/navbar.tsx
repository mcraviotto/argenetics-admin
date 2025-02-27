'use client'

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useUserQuery } from "@/services/auth"
import { FileText, Hospital, Stethoscope, User } from "lucide-react"
import { useTransitionRouter } from "next-view-transitions"
import { usePathname } from "next/navigation"

const tabs = [
  { id: "views/doctors", label: "Médicos", icon: Stethoscope },
  { id: "views/medical-institutions", label: "Centros médicos", icon: Hospital },
  { id: "views/patients", label: "Pacientes", icon: User },
  { id: "views/studies", label: "Estudios", icon: FileText }
]

const allowedTabsByRole: Record<string, string[]> = {
  Administrator: ["views/doctors", "views/medical-institutions", "views/patients", "views/studies"],
  Doctor: ["views/studies", "views/patients"],
  Patient: ["views/studies"],
  MedicalInstitution: ["views/studies", "views/doctors", "views/patients"]
}

export default function Navbar() {
  const router = useTransitionRouter()
  const pathname = usePathname()

  const { data: user, isLoading } = useUserQuery()

  const filteredTabs = user ? tabs.filter(tab => allowedTabsByRole[user.userable_type]?.includes(tab.id)) : tabs

  const activeTab = filteredTabs.find(tab => pathname.includes(tab.id))?.id || filteredTabs[0]?.id || ""

  return (
    <Tabs value={activeTab} className="px-6 border-b border-border shadow-sm relative z-10 bg-background flex items-center">
      <TabsList className="gap-2 bg-transparent py-2">
        {filteredTabs.map((tab, idx) => (
          <TabsTrigger value={tab.id} key={tab.id} asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:shadow-primary/50 hover:bg-accent", isLoading && "blur-md data-[state=active]:bg-inherit data-[state=active]:shadow-none data-[state=active]:text-foreground pointer-events-none", isLoading && idx === 0 && "!bg-primary")}
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
