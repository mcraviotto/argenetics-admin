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
import { setDialogsState } from "@/lib/store/dialogs-store";
import { cn } from "@/lib/utils";
import { ClientStudies } from "@/schemas/doctors";
import { useDownloadClientStudyMutation } from "@/services/studies";
import {
  ColumnDef,
  Row
} from "@tanstack/react-table";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Ellipsis, FileDown, SquarePen, Trash } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";

function RowActions({ row }: { row: Row<ClientStudies['data'][0]> }) {
  const router = useTransitionRouter()

  const [downloadClientStudy] = useDownloadClientStudyMutation()

  const handleDownload = async () => {
    const { data } = await downloadClientStudy(row.original.id)
    if (data) {
      window.open(data.url, "_blank")
    }
  }

  return (
    <TooltipProvider delayDuration={1000}>
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleDownload}
              size="icon"
              variant="ghost"
              className="shadow-none rounded-full"
            >
              <FileDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="px-2 py-1 text-xs"
          >
            Descagar estudio
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="shadow-none rounded-full">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(`/users/${row.original.client_id}/${row.original.id}`)}
              >
                <SquarePen />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDialogsState({
                  open: "delete-client-study",
                  payload: {
                    client_study_id: row.original.id,
                    user_id: row.original.client_id
                  }
                })}
                className="text-destructive focus:text-destructive"
              >
                <Trash />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}

export const columns: ColumnDef<ClientStudies['data'][0]>[] = [
  {
    header: "Título",
    accessorKey: "title",
    cell: ({ row }) => <div className="font-medium">
      <Link href={`/users/${row.original.client_id}/${row.original.id}`} className="hover:underline">
        {row.original.title}
      </Link>
    </div>,
    size: 180,
    enableHiding: false,
  },
  {
    header: "Fecha",
    accessorKey: "date",
    size: 220,
    cell: ({ row }) => format(parse(row.original.date, "dd/MM/yyyy", new Date()), "dd MMM yyyy", { locale: es }),
  },
  {
    header: "Estado",
    accessorFn: (row) => row.state,
    id: "status",
    cell: ({ row }) => {
      const state = row.original.state as keyof typeof study_status_adapter
      return <Badge
        className={cn("shadow-lg",
          study_status_adapter[state].color,
        )}
      >
        {study_status_adapter[state].label}
      </Badge>
    },
    size: 100,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];
