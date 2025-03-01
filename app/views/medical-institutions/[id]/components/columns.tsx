import { doctor_status_adapter } from "@/app/views/doctors/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ListDoctor } from "@/schemas/doctors";
import {
  ColumnDef
} from "@tanstack/react-table";
import { Link } from "next-view-transitions";

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
];
