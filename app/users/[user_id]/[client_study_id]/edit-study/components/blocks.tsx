import { BlocksIcon, Pencil, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useWatch, useFormContext } from "react-hook-form";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetClientStudyQuery } from "@/services/studies";
import { setDialogsState } from "@/lib/store/dialogs-store";

export default function Blocks() {
  const { client_study_id } = useParams<{ client_study_id: string; }>();

  const { data: clientStudy } = useGetClientStudyQuery(client_study_id);

  const metadata = useWatch({ name: "metadata" });

  const { setValue, formState } = useFormContext<any>();

  const containerClass =
    "p-4 rounded-md bg-secondary shadow-sm hover:shadow-md hover:bg-secondary/50 transition-all relative group";

  if (!metadata || (!metadata.blocks.length && !metadata.obs)) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-md p-6 gap-2",
          formState.errors.metadata ? "text-destructive" : "text-muted-foreground"
        )}
      >
        <BlocksIcon className="w-8 h-8" />
        <p className="text-left text-sm">
          {formState.errors.metadata ? "Debes agregar al menos un bloque." : "No hay bloques para mostrar."}
        </p>
      </div>
    );
  }

  if (clientStudy?.code === "nutritional") {
    return (
      <div className="space-y-4">
        {metadata.blocks.map((block: { title: string; body: string }, index: number) => (
          <div key={index} className={containerClass}>
            <span className="font-medium">{block.title}</span>
            <MarkdownPreview
              wrapperElement={{ "data-color-mode": "light" }}
              source={block.body}
              className="!text-sm"
              style={{ padding: 16, all: "revert" }}
            />
            <Button
              className="absolute top-4 right-4 rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="destructive"
              type="button"
              size="icon"
              onClick={() => {
                const blocks = metadata.blocks.filter((_: any, i: number) => i !== index);
                setValue("metadata", { ...metadata, blocks });
              }}
            >
              <Trash />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  if (clientStudy?.code === "training") {
    return (
      <div className="space-y-4">
        {metadata.blocks.map((block: { day: string; body: string }, index: number) => (
          <div key={index} className={containerClass}>
            <span className="font-medium">
              {block.day}
            </span>
            <MarkdownPreview
              wrapperElement={{ "data-color-mode": "light" }}
              source={block.body}
              className="!text-sm"
              style={{ padding: 16, all: "revert" }}
            />
            <Button
              className="absolute top-4 right-4 rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="destructive"
              type="button"
              size="icon"
              onClick={() => {
                const blocks = metadata.blocks.filter((_: any, i: number) => i !== index);
                setValue("metadata", { ...metadata, blocks });
              }}
            >
              <Trash />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  if (clientStudy?.code === "supplements") {
    return (
      <div className="space-y-4">
        {metadata.blocks.map((block: { supplement: string; body: string; dose: string }, index: number) => (
          <div key={index} className={containerClass}>
            <div className="inline-block">
              <span className="font-semibold">{block.supplement}:{" "}</span>{block.body}
            </div>
            <div>
              <span className="font-semibold">Dosis:{" "}</span><span>{block.dose}</span>
            </div>
            <div className="flex gap-2 absolute top-4 right-4">
              <Button
                className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                variant="outline"
                type="button"
                size="icon"
                onClick={() => {
                  setDialogsState({
                    open: "edit-block",
                    payload: { blockId: index },
                  });
                }}
              >
                <Pencil />
              </Button>
              <Button
                className="rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                variant="destructive"
                type="button"
                size="icon"
                onClick={() => {
                  const blocks = metadata.blocks.filter((_: any, i: number) => i !== index);
                  setValue("metadata", { ...metadata, blocks });
                }}
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (clientStudy?.code === "lab" || clientStudy?.code === "in_body") {
    return (
      <div className={containerClass}>
        <span className="font-bold mr-2">Observaciones:</span>
        <span>{metadata.obs || "No hay observaciones"}</span>
      </div>
    );
  }

  return <div>No hay bloques definidos para este estudio.</div>;
}
