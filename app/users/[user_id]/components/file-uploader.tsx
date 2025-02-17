import { cn, handleRipple } from "@/lib/utils";
import { useState } from "react";
import { useFormContext } from "react-hook-form";


export default function FileUploader({
  onChange,
}: {
  onChange: (file: File) => void
}) {
  const [dragging, setDragging] = useState(false);

  const { formState } = useFormContext<any>();

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  return (
    <div className="flex items-center flex-col justify-center w-full mt-10 z-10">
      <label
        htmlFor="dropzone-file"
        className={`transition-all flex overflow-hidden relative mb-4 over border-dashed group flex-col z-10 items-center justify-center w-full border rounded-lg cursor-pointer hover:bg-border/25`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPointerDown={handleRipple}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          const file = e.dataTransfer?.files?.[0];
          if (file) {
            onChange(file);
          }
        }}
      >
        <input
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onChange(file);
            }
          }}
          id="dropzone-file"
          accept="application/pdf"
          type="file"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center pt-5 pb-6 z-0 pointer-events-none gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-slot="icon"
            className={cn("w-8 h-8 text-muted-foreground overflow-visible",
              formState.errors.file ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <path
              d="M19 13V17C19 17.5304 18.7893 18.0391 18.4142 18.4142C18.0391 18.7893 17.5304 19 17 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className={`transition-all
                group-hover:transform group-hover:translate-y-[-4px]
                ${dragging ? "transform translate-y-[-4px]" : ""}`}
              d="M15 6L10 1M10 1L5 6M10 1V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className={cn("text-sm text-muted-foreground text-center",
            formState.errors.file ? "text-destructive" : "text-muted-foreground"
          )}>
            <span className="font-semibold">
              Arrastra y soltá un archivo PDF
            </span> o hacé click para seleccionar uno.
          </p>
        </div>
      </label>
    </div>
  )
}