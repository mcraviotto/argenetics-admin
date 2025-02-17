import { z } from "zod";

export const createStudySchema = (studyCode: string, fileRequired: boolean = true) => {
  const baseSchema = z.object({
    client_id: z.string(),
    study_code: z.string(),
    file: !fileRequired ? z.instanceof(File, {
      message: "El archivo es requerido",
    }).optional() : z.instanceof(File, {
      message: "El archivo es requerido",
    }),
    metadata: z.object({}).passthrough().optional(),
    storage_ref: z.string().optional(),
  });
  switch (studyCode) {
    case "nutritional":
      return baseSchema.merge(
        z.object({
          metadata: z.object({
            blocks: z.array(
              z.object({
                title: z.string(),
                body: z.string(),
              })
            ),
          }),
        })
      );
    case "training":
      return baseSchema.merge(
        z.object({
          metadata: z.object({
            blocks: z.array(
              z.object({
                day: z.string(),
                body: z.string(),
              })
            ),
          }),
        })
      );
    case "supplements":
      return baseSchema.merge(
        z.object({
          metadata: z.object({
            blocks: z.array(
              z.object({
                supplement: z.string(),
                body: z.string(),
                dose: z.string(),
              })
            ),
            note: z.string().optional(),
          }),
        })
      );
    case "lab":
      return baseSchema.merge(
        z.object({
          metadata: z.object({
            obs: z.string(),
          }),
        })
      );
    case "in_body":
      return baseSchema.merge(
        z.object({
          metadata: z.object({
            obs: z.string(),
          }),
        })
      );
    case "genetic":
      return baseSchema.merge(
        z.object({
          metadata: z.object({
            obs: z.string(),
          }),
        })
      );
    default:
      return baseSchema;
  }
};

export const getBlockSchemaAndDefaults = (study_id: string) => {
  switch (study_id) {
    case "nutritional":
      return {
        schema: z.object({
          title: z.string().nonempty("El título es requerido"),
          body: z.string().nonempty("El contenido es requerido"),
        }),
        defaultValues: { title: "", body: "" },
        fields: [
          { name: "title", label: "Título", type: "text" },
          { name: "body", label: "Contenido", type: "textarea" },
        ]
      };
    case "training":
      return {
        schema: z.object({
          day: z.string().nonempty("El día es requerido"),
          body: z.string().nonempty("El contenido es requerido"),
        }),
        defaultValues: { day: "", body: "" },
        fields: [
          { name: "day", label: "Día", type: "text" },
          { name: "body", label: "Contenido", type: "textarea" },
        ]
      };
    case "supplements":
      return {
        schema: z.object({
          supplement: z.string().nonempty("El suplemento es requerido"),
          body: z.string().nonempty("La descripción es requerida"),
          dose: z.string().nonempty("La dosis es requerida"),
        }),
        defaultValues: { supplement: "", body: "", dose: "" },
        fields: [
          { name: "supplement", label: "Suplemento", type: "text" },
          { name: "body", label: "Descripción", type: "textarea" },
          { name: "dose", label: "Dosis", type: "text" },
        ]
      };
    case "lab":
      return {
        schema: z.object({
          obs: z.string().nonempty("La observación es requerida"),
        }),
        defaultValues: { obs: "" },
        fields: [
          { name: "obs", label: "Observación", type: "textarea" },
        ]
      };
    case "in_body":
      return {
        schema: z.object({
          obs: z.string().nonempty("La observación es requerida"),
        }),
        defaultValues: { obs: "" },
        fields: [
          { name: "obs", label: "Observación", type: "textarea" },
        ]
      };
    case "genetic":
      return {
        schema: z.object({
          obs: z.string().nonempty("La observación es requerida"),
        }),
        defaultValues: { obs: "" },
        fields: [
          { name: "obs", label: "Observación", type: "textarea" },
        ]
      };
    default:
      return {
        schema: z.object({}),
        defaultValues: {},
        fields: []
      };
  }
};
