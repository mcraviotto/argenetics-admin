'use client'

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Megaphone, Users } from "lucide-react"
import { useTransitionRouter } from "next-view-transitions"
import { usePathname } from "next/navigation"

const tabs = [
  {
    id: "users",
    label: "Clientes",
    icon: Users
  },
  {
    id: "notifications",
    label: "Notificaciones",
    icon: Megaphone
  }
]

export default function Navbar() {
  const router = useTransitionRouter()
  const pathname = usePathname()

  const activeTab = tabs.find((tab) => pathname.includes(tab.id))?.id || tabs[0].id

  return (
    <Tabs value={activeTab} className="px-6 border-b border-border shadow-md shadow-border relative z-10 bg-background">
      <div className="flex">
        <TabsList className="h-auto gap-2 rounded-none bg-transparent py-1 text-foreground w-full justify-start relative max-w-7xl mx-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="px-4 py-2 relative hover:text-foreground !shadow-none"
              asChild
            >
              <Button
                variant="ghost"
                className="data-[state='active']:text-primary hover:!bg-accent rounded-b-none"
                onClick={() => router.push(`/${tab.id}`)}
              >
                {tab.icon && <tab.icon size={16} className="-ms-0.5 me-1.5 opacity-60" aria-hidden strokeWidth={2} />}
                {tab.label}
              </Button>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}