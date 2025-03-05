import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowLeft, HospitalIcon, Stethoscope, User } from "lucide-react"
import { Link } from "next-view-transitions"

const user_types = [
  {
    label: "Paciente",
    value: "patient",
    description: "Registro para pacientes que buscan servicios médicos",
    icon: User,
  },
  {
    label: "Médico",
    value: "doctor",
    description: "Registro para médicos que buscan pacientes",
    icon: Stethoscope,
  },
  {
    label: "Institución médica",
    value: "institution",
    description: "Registro para instituciones médicas",
    icon: HospitalIcon,
  },
]

export default function SignUpPage() {
  return (
    <Card className="shadow-lg shadow-border p-3 sm:p-6 border-none w-full max-w-4xl mx-auto">
      <CardHeader className="text-center relative p-4 sm:p-6">
        <Button
          variant="link"
          className="px-2 absolute top-2 left-2 sm:top-2 sm:left-4"
          type="button"
          disableRipple
          asChild
        >
          <Link href="/sign-in" className="flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
        </Button>
        <CardTitle className="text-xl sm:text-2xl font-medium mt-2">Registrate</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-center">
          Selecciona el tipo de usuario que deseas registrar
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full")}>
        {user_types.map((user_type) => (
          <Button
            key={user_type.value}
            className="cursor-pointer shadow-sm shadow-border w-full hover:border-primary hover:shadow-primary/50 transition-colors group bg-background h-auto text-inherit hover:bg-background border whitespace-normal p-0"
            asChild
          >
            <Link href={`/sign-up/${user_type.value}`} className="w-full">
              <CardContent className="text-center flex flex-col items-center p-4 sm:p-6 gap-2 group-hover:text-primary transition-colors w-full">
                <user_type.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-sm font-medium">{user_type.label}</span>
                <p className="text-xs sm:text-sm text-center text-muted-foreground">{user_type.description}</p>
              </CardContent>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

