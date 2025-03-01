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
import { ListStudy } from "@/schemas/studies";
import { useUserQuery } from "@/services/auth";
import {
  ColumnDef,
  Row
} from "@tanstack/react-table";
import { Ellipsis, Eye, SquarePen } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { study_options } from "../data";
import { study_status_adapter } from "../utils";

function RowActions({ row }: { row: Row<ListStudy> }) {
  const router = useTransitionRouter()
  const { data: user } = useUserQuery()

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
              onClick={() => router.push(`/views/studies/${row.original.id}`)}
            >
              <Eye />
              <span>Ver detalles</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {user?.userable_type === "Administrator" &&
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(`/views/studies/${row.original.id}/edit`)}
              >
                <SquarePen />
                <span>Editar</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

export const columns: ColumnDef<ListStudy>[] = [
  {
    header: "Estudio",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">
      <Link href={`/views/studies/${row.original.id}`} className="hover:underline">
        {study_options.flatMap(category => category.items).find(study => study.value === row.original.title)?.label || row.original.title}
      </Link>
    </div>,
    size: 180,
    enableHiding: false,
  },
  {
    header: "Paciente",
    accessorKey: "patient_name",
    size: 220,
  },
  {
    header: "Fecha del estudio",
    accessorKey: "date",
    size: 220,
  },
  {
    header: "Estado",
    accessorFn: (row) => row.state,
    id: "status",
    cell: ({ row }) => (
      <Badge
        className={cn("shadow-none rounded-sm",
          study_status_adapter[row.original.state as keyof typeof study_status_adapter].color,
        )}
      >
        {study_status_adapter[row.original.state as keyof typeof study_status_adapter].label}
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
