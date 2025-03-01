'use client'

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
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
import { useLazyGetDoctorQuery } from "@/services/doctors";
import { useLazyGetPatientQuery } from "@/services/patients";
import { useLazyGetStudyQuery } from "@/services/studies";
import { useLazyGetInstitutionQuery } from "@/services/institutions";
import { study_options } from "@/app/views/studies/data";

const breadcrumbMap: Record<string, string> = {
  patients: "Pacientes",
  studies: "Estudios",
  doctors: "Doctores",
  "medical-institutions": "Instituciones médicas",
  edit: "Editar",
  new: "Nuevo",
};

const useLazyDynamicQuery = (resource: string) => {
  const [triggerDoctor, resultDoctor] = useLazyGetDoctorQuery();
  const [triggerPatient, resultPatient] = useLazyGetPatientQuery();
  const [triggerStudy, resultStudy] = useLazyGetStudyQuery();
  const [triggerMedicalInstitution, resultMedicalInstitution] = useLazyGetInstitutionQuery();

  if (resource === "doctors") {
    return [triggerDoctor, resultDoctor] as const;
  }
  if (resource === "patients") {
    return [triggerPatient, resultPatient] as const;
  }
  if (resource === "studies") {
    return [triggerStudy, resultStudy] as const;
  }
  if (resource === "medical-institutions") {
    return [triggerMedicalInstitution, resultMedicalInstitution] as const;
  }
  return [triggerDoctor, resultDoctor] as const;
};

interface DynamicNameProps {
  id: string;
  resource: string;
}

const getDisplayName = (resource: string, data: any, id: string): string => {
  switch (resource) {
    case "doctors":
    case "patients":
      return data?.first_name && data?.last_name
        ? `${data.first_name} ${data.last_name}`
        : id;
    case "medical-institutions":
      return data?.name || id;
    case "studies":
      return (
        study_options
          .flatMap(category => category.items)
          .find(study => study.value === data?.title)?.label ||
        data?.title ||
        id
      );
    default:
      return id;
  }
};

const DynamicName: React.FC<DynamicNameProps> = ({ id, resource }) => {
  const [trigger, result] = useLazyDynamicQuery(resource);

  useEffect(() => {
    if (id) {
      trigger(id);
    }
  }, [id, trigger]);

  if (result.isUninitialized || result.isLoading || !result.data) {
    return (
      <span style={{ filter: "blur(6px)" }}>
        Cargando...
      </span>
    );
  }
  return <span>{getDisplayName(resource, result.data, id)}</span>;
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").slice(1).filter(Boolean);

  let cumulativeHref = "";
  const breadcrumbSegments = segments.reduce(
    (acc: { segment: string; href: string }[], segment) => {
      cumulativeHref += "/" + segment;
      if (segment === "views") return acc;
      acc.push({ segment, href: cumulativeHref });
      return acc;
    },
    []
  );

  const renderLabelContent = (segment: string, index: number) => {
    if (breadcrumbMap[segment]) return breadcrumbMap[segment];

    if (index > 0) {
      const parentSegment = breadcrumbSegments[index - 1].segment;
      if (
        parentSegment === "doctors" ||
        parentSegment === "patients" ||
        parentSegment === "studies" ||
        parentSegment === "medical-institutions"
      ) {
        return <DynamicName id={segment} resource={parentSegment} />;
      }
    }
    return segment;
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
        {breadcrumbSegments.length > 0 && <BreadcrumbSeparator> / </BreadcrumbSeparator>}
        {breadcrumbSegments.map((item, index) => {
          const isLast = index === breadcrumbSegments.length - 1;
          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>
                    {renderLabelContent(item.segment, index)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>
                      {renderLabelContent(item.segment, index)}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator> / </BreadcrumbSeparator>}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}
