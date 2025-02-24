import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ListPatient } from "@/schemas/patients";
import {
  ColumnDef,
  Row
} from "@tanstack/react-table";
import { Ellipsis, Eye, SquarePen } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { patient_status_adapter } from "../utils";

function RowActions({ row }: { row: Row<ListPatient> }) {
  const router = useTransitionRouter()

  return (
    <TooltipProvider delayDuration={1000}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="shadow-none rounded-full">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(`/views/patients/${row.original.id}`)}
            >
              <Eye />
              <span>Ver detalles</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(`/views/patients/${row.original.id}/edit`)}
            >
              <SquarePen />
              <span>Editar</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

export const columns: ColumnDef<ListPatient>[] = [
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">
      <Link href={`/views/patients/${row.original.id}`} className="hover:underline">
        {row.original.first_name}
        {" "}
        {row.original.last_name}
      </Link>
    </div>,
    size: 180,
    enableHiding: false,
  },
  {
    header: "Correo electrónico",
    accessorKey: "user.email",
    size: 220,
  },
  {
    header: "Número de identificación",
    accessorKey: "identification_number",
    size: 220,
  },
  {
    header: "Estado",
    accessorFn: (row) => row.user.state,
    id: "status",
    cell: ({ row }) => (
      <Badge
        className={cn("shadow-none rounded-sm",
          patient_status_adapter[row.original.user.state as keyof typeof patient_status_adapter].color,
        )}
      >
        {patient_status_adapter[row.original.user.state as keyof typeof patient_status_adapter].label}
      </Badge>
    ),
    size: 100,
  },
  {
    id: "actions",
    header: () => <span>Acciones</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];
