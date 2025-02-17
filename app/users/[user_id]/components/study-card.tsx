import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUp } from "lucide-react";
import { Link } from "next-view-transitions";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useListClientStudiesQuery } from "@/services/studies";
import { studies_extension } from "../data";


export default function StudyCard({ study, isStudiesLoading }: {
  study: {
    id: string;
    title: string;
    code: string;
  } | {
    code: string;
    title: string;
    img: string;
  },
  isStudiesLoading: boolean,
}) {
  const pathname = usePathname();
  const params = useParams();

  const clientId = params.user_id as string;
  const study_extension = studies_extension.find((ext) => ext.code === study.code);

  const { data: clientStudies } = useListClientStudiesQuery(clientId);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const loadedStudy = clientStudies?.data?.find((clientStudy) => clientStudy.code === study.code);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div
        className="cursor-dot"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          opacity: isHovering ? 1 : 0
        }}
      >
        {loadedStudy ? <ArrowUp /> : <ArrowRight />}
      </div>
      <button
        className={cn(
          "group relative flex h-52 w-72 flex-col justify-end overflow-hidden !rounded-lg p-5 shadow-lg shadow-border transition-all hover:shadow-xl hover:cursor-none",
          loadedStudy && "opacity-50"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Link
          href={isStudiesLoading ? "#" :
            loadedStudy ? `${pathname.split("/").slice(0, -1).join("/")}/${loadedStudy.id}` :
              `${pathname}/${study.code}`
          }
          className="custom-cursor absolute inset-0 flex flex-col justify-end p-5 overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <img
              className={cn("absolute inset-0 h-full w-full object-cover transition-all will-change-transform group-hover:scale-110",
                isStudiesLoading ? "blur-lg" : "blur-none"
              )}
              src={study_extension?.img}
              aria-hidden="true"
            />
            <div className={cn("absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90 transition-opacity duration-300 ease-out group-hover:opacity-90")} />
          </div>
          <div className="relative z-10 translate-y-0 transform transition-all duration-300 ease-out">
            <h2 className={cn("text-lg font-semibold text-white/75 transition-all duration-300 ease-out group-hover:text-white text-left",
              isStudiesLoading ? "blur-[6px] text-white font-bold" : "blur-none"
            )}>
              {study.title}
            </h2>
          </div>
        </Link>
      </button>
    </>
  )
}