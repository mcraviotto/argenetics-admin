"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"
import { useTransitionRouter } from "next-view-transitions"

export default function WaitingPage() {
  const router = useTransitionRouter()

  return (
    <div className={cn("flex flex-col gap-6 w-full")}>
      <Card className="shadow-lg shadow-border p-3 sm:p-6 border-none">
        <CardHeader className="text-center p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-medium">Estamos verificando tus datos</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Te vamos a enviar un correo electrónico cuando tu usuario esté activo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:gap-6 items-center px-3 sm:px-6">
          <div className="w-fit p-2 border rounded-full shadow-lg">
            <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary" />
          </div>
          <Button className="w-full" onClick={() => router.push("/sign-in")}>
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}