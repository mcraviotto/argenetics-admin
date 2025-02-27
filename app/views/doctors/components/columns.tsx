import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ListDoctor } from "@/schemas/doctors";
import {
  ColumnDef,
  Row
} from "@tanstack/react-table";
import { Ellipsis, Eye, SquarePen } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { doctor_status_adapter } from "../utils";

function RowActions({ row }: { row: Row<ListDoctor> }) {
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
              onClick={() => router.push(`/views/doctors/${row.original.id}`)}
            >
              <Eye />
              <span>Ver detalles</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(`/views/doctors/${row.original.id}/edit`)}
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

export const columns: ColumnDef<ListDoctor>[] = [
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">
      <Link href={`/views/doctors/${row.original.id}`} className="hover:underline">
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
    header: "Centro médico",
    accessorKey: "medical_institutions",
    size: 400,
    cell: ({ row }) => {
      const institutions = row.original.medical_institutions;
      const displayInstitutions = institutions.slice(0, 2);
      const extraCount = institutions.length - displayInstitutions.length;

      return (
        <div className="flex flex-wrap gap-2">
          {displayInstitutions.map((institution) => (
            <Badge
              key={institution.id}
              variant="outline"
              className="rounded-md px-2 py-1 bg-secondary border-0"
            >
              {institution.name}
            </Badge>
          ))}
          {extraCount > 0 && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="rounded-md px-2 py-1 bg-secondary border-0">
                    +{extraCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="px-2 text-xs max-w-[600px] flex flex-wrap gap-2">
                  {institutions.slice(2).map((institution) => (
                    <Badge
                      key={institution.id}
                      variant="outline"
                      className="rounded-md px-2 py-1 bg-secondary border-0"
                    >
                      {institution.name}
                    </Badge>
                  ))}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    header: "Estado",
    accessorFn: (row) => row.user.state,
    id: "status",
    cell: ({ row }) => (
      <Badge
        className={cn("shadow-none rounded-sm",
          doctor_status_adapter[row.original.user.state as keyof typeof doctor_status_adapter].color,
        )}
      >
        {doctor_status_adapter[row.original.user.state as keyof typeof doctor_status_adapter].label}
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
