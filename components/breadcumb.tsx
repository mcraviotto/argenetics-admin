'use client'

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as ShadcnBreadcrumb,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import React from "react";

const breadcrumbMap: Record<string, string> = {

};

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split("/").slice(1).filter(Boolean);

  const renderLabelContent = (segment: string) => {
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
          const href = `/${segments.slice(0, index + 1).join("/")}`;

          if (isLast) {
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
