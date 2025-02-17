"use client";

import { useListStudiesQuery } from "@/services/studies";
import StudyCard from "../components/study-card";
import { studies_extension } from "../data";

export default function SelectStudyPage() {
  const { data: studiesData, isLoading: isStudiesLoading } = useListStudiesQuery(undefined);

  const studies = isStudiesLoading ? studies_extension : studiesData;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Seleccionar estudio</h1>
      <div className="flex flex-wrap justify-start items-start gap-5">
        {studies?.map((study) =>
          <StudyCard
            key={study.code}
            study={study}
            isStudiesLoading={isStudiesLoading}
          />
        )}
      </div>
    </div>
  );
}