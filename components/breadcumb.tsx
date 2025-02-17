'use client'

import React from "react";
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { useGetClientQuery } from "@/services/clients";
import { useGetClientStudyQuery, useGetStudyQuery } from "@/services/studies";
import { Home } from "lucide-react";
import { Link } from "next-view-transitions";
import { useParams, usePathname } from "next/navigation";

const breadcrumbMap: Record<string, string> = {
  users: "Clientes",
  new: "Nuevo cliente",
  "new-study": "Cargar estudio",
  "edit-study": "Editar estudio",
  edit: "Editar cliente",
  notifications: "Notificaciones",
};

export default function Breadcrumb() {
  const pathname = usePathname();

  const { user_id, study_id, client_study_id } = useParams<{ user_id?: string; study_id?: string; client_study_id?: string }>();

  const { data: client, isFetching: isClientFetching } = useGetClientQuery(user_id ?? "", { skip: !user_id });
  const { data: study, isFetching: isStudyFetching } = useGetStudyQuery(study_id ?? "");
  const { data: clientStudy, isFetching: isClientStudyFetching } = useGetClientStudyQuery(client_study_id ?? "");

  const segments = pathname.split("/").slice(1).filter(Boolean);

  const renderLabelContent = (segment: string) => {
    const isUserId = segment === user_id;
    const isStudy = segment === study_id;

    if (isUserId) {
      return (
        <span
          className={cn(
            "transition-all duration-200",
            isClientFetching ? "text-muted-foreground font-normal blur-[6px]" : "blur-none"
          )}
        >
          {client ? `${client.first_name} ${client.last_name}` : "Agustin Delgado"}
        </span>
      );
    }
    if (isStudy) {
      return (
        <span
          className={cn(
            "font-medium transition-all duration-200",
            isStudyFetching ? "text-muted-foreground font-normal blur-[6px]" : "blur-none"
          )}
        >
          {study ? study.title : "Suplementos"}
        </span>
      );
    }
    if (segment === client_study_id) {
      return (
        <span
          className={cn(
            "font-medium transition-all duration-200",
            isClientStudyFetching ? "text-muted-foreground font-normal blur-[6px]" : "blur-none"
          )}
        >
          {clientStudy ? clientStudy.title : "Suplementos"}
        </span>
      );
    }

    return breadcrumbMap[segment] || segment;
  };

  return (
    <ShadcnBreadcrumb className="h-[36px] flex items-center">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <Home size={16} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Inicio</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator> / </BreadcrumbSeparator>

        {segments.map((segment, index) => {
          const labelContent = renderLabelContent(segment);
          const isLast = index === segments.length - 1;
          const isEditStudy = segment === "edit-study";
          const href = `/${segments.slice(0, index + 1).join("/")}`;

          if (isLast || isEditStudy) {
            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  <BreadcrumbPage>{labelContent}</BreadcrumbPage>
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator> / </BreadcrumbSeparator>}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={href}>{labelContent}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator> / </BreadcrumbSeparator>
              </React.Fragment>
            );
          }
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}
