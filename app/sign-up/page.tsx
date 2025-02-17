import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, HospitalIcon, Stethoscope, User } from "lucide-react";
import { Link } from "next-view-transitions";

const user_types = [
  {
    label: "Paciente",
    value: "patient",
    description: "Registro para pacientes que buscan servicios médicos",
    icon: User
  },
  {
    label: "Médico",
    value: "doctor",
    description: "Registro para médicos que buscan pacientes",
    icon: Stethoscope
  },
  {
    label: "Institución médica",
    value: "institution",
    description: "Registro para instituciones médicas",
    icon: HospitalIcon
  }
];

export default function SignUpPage() {

  return (
    <Card className="shadow-lg shadow-border p-6 border-none">
      <CardHeader className="text-center relative">
        <Button
          variant="link"
          className="px-2 absolute top-2 left-4"
          type="button"
          disableRipple
          asChild
        >
          <Link href="/sign-in">
            <ArrowLeft />
            Volver
          </Link>
        </Button>
        <CardTitle className="text-2xl font-medium">Registrate</CardTitle>
        <CardDescription className="text-sm text-center">Selecciona el tipo de usuario que deseas registrar</CardDescription>
      </CardHeader>
      <CardContent className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 w-max")}>
        {user_types.map((user_type) => (
          <Button
            key={user_type.value}
            className="cursor-pointer shadow-sm shadow-border w-[300px] hover:border-primary hover:shadow-primary/50 transition-colors group bg-background h-auto text-inherit hover:bg-background border whitespace-normal p-0"
            asChild
          >
            <Link href={`/sign-up/${user_type.value}`}>
              <CardContent className="text-center flex flex-col items-center p-6 gap-2 group-hover:text-primary transition-colors">
                <user_type.icon className="!h-6 !w-6" />
                <span className="text-sm font-medium">{user_type.label}</span>
                <p className="text-sm text-center text-muted-foreground">{user_type.description}</p>
              </CardContent>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}