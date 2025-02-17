import { notification_types } from "@/app/users/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Notification } from "@/schemas/notifications";
import {
  ColumnDef
} from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const notificationType = {
  in_app: "In-app",
  push: "Push",
}

export const columns: ColumnDef<Notification>[] = [
  {
    header: "Título",
    accessorKey: "title",
    cell: ({ row }) => <div className="font-medium">
      {row.original.title}
    </div>,
    size: 180,
    enableHiding: false,
  },
  {
    header: "Envíado por",
    accessorKey: "sent_by",
    size: 180,
    cell: ({ row }) => <div>
      {row.original.sent_by}
    </div>
  },
  {
    header: "Tipo",
    accessorKey: "notification_type",
    size: 220,
    cell: ({ row }) => <div>
      <Badge
        className={cn("shadow-lg",
          notification_types[row.original.notification_type as keyof typeof notificationType].color,
        )}
      >
        {notificationType[row.original.notification_type as keyof typeof notificationType]}
      </Badge>
    </div>,
  },
  {
    header: "Clientes alcanzados",
    accessorKey: "clients_count",
    size: 220,
    cell: ({ row }) => <div>
      {row.original.clients_count === 0 ? "Todos los clientes" : row.original.clients_count}
    </div>,
  },
  {
    header: "Fecha de creación",
    accessorKey: "created_at",
    size: 220,
    cell: ({ row }) => <div>
      {row.original.created_at}
    </div>,
  },
];
