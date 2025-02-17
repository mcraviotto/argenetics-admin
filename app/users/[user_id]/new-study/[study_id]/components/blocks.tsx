import { BlocksIcon, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useWatch, useFormContext } from "react-hook-form";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Blocks() {
  const { study_id } = useParams<{ study_id: string; user_id: string }>();

  const metadata = useWatch({ name: "metadata" });

  const { setValue, formState } = useFormContext<any>();

  const containerClass =
    "p-4 rounded-md bg-secondary shadow-sm hover:shadow-md hover:bg-secondary/50 transition-all relative group";

  if (!metadata || (!metadata.blocks && !metadata.obs)) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-md p-6 gap-2",
          formState.errors.metadata ? "text-destructive" : "text-muted-foreground"
        )}
      >
        <BlocksIcon className="w-8 h-8" />
        <p className="text-left text-sm">
          {formState.errors.metadata
            ? "Debes agregar al menos un bloque."
            : "No hay bloques para mostrar."}
        </p>
      </div>
    );
  }

  if (study_id === "nutritional") {
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

  if (study_id === "training") {
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

  if (study_id === "supplements") {
    return (
      <div className="space-y-4">
        {metadata.blocks.map((block: { supplement: string; body: string; dose: string }, index: number) => (
          <div key={index} className={containerClass}>
            <div className="flex gap-1">
              <span className="font-semibold">
                {block.supplement}:
              </span>
              {block.supplement}
            </div>
            <div>
              <span>{block.dose}</span>
            </div>
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

  if (study_id === "lab" || study_id === "in_body") {
    return (
      <div className={containerClass}>
        <span className="font-bold mr-2">Observaciones:</span>
        <span>{metadata.obs || "No hay observaciones"}</span>
      </div>
    );
  }

  return <div>No hay bloques definidos para este estudio.</div>;
}
