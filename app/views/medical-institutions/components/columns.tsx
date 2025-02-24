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
import { ListInstitution } from "@/schemas/institutions";
import {
  ColumnDef,
  Row
} from "@tanstack/react-table";
import { Ellipsis, Eye, SquarePen } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { institutions_status_adapter } from "../utils";

function RowActions({ row }: { row: Row<ListInstitution> }) {
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
              onClick={() => router.push(`/views/medical-institutions/${row.original.id}`)}
            >
              <Eye />
              <span>Ver detalles</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(`/views/medical-institutions/${row.original.id}/edit`)}
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

export const columns: ColumnDef<ListInstitution>[] = [
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => <div className="font-medium">
      <Link href={`/views/medical-institutions/${row.original.id}`} className="hover:underline">
        {row.original.name}
      </Link>
    </div>,
    size: 180,
    enableHiding: false,
  },
  {
    header: "Médicos asociados",
    accessorKey: "doctors_count",
    size: 220,
  },
  {
    header: "Estado",
    accessorFn: (row) => row.user?.state,
    id: "status",
    cell: ({ row }) => {
      if (!row.original?.user) {
        return (
          <Badge
            className={cn("shadow-none rounded-sm",
              institutions_status_adapter.rejected.color,
            )}
          >
            {institutions_status_adapter.rejected.label}
          </Badge>
        )
      }
      return <Badge
        className={cn("shadow-none rounded-sm",
          institutions_status_adapter[row.original?.user?.state as keyof typeof institutions_status_adapter]?.color,
        )}
      >
        {institutions_status_adapter[row.original?.user?.state as keyof typeof institutions_status_adapter]?.label}
      </Badge>
    },
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
