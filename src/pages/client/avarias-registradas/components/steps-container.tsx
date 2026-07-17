import { cn } from "@/lib/utils";

interface StepsContainerProps {
  ammount: number;
  current: number;
}
export default function StepsContainer({ ammount, current }: StepsContainerProps) {

  // Validação de etapa atual
  if (current < 1 || current > ammount) {
    throw new Error("Etapa atual inválida para StepsContainer")
  }

  return (
    <div className="flex gap-3">
      {
        Array(ammount).fill(0).map((_, index) => (
          <div key={index} className={cn("p-1 rounded-full w-full border bg-slate-200", {
            "bg-blue-500": index <= current-1
          })}></div>
        ))
      }
    </div>
  )
}