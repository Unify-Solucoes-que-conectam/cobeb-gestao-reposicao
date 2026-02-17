import { useHeader } from "@/hooks/use-header";
import { useEffect } from "react";

export default function AdminMapas() {

  // =============== HOOKS   ===============
  const { setPageBreadcrumbs } = useHeader();

  useEffect(() => {
    // definir título da página
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Mapas", href: "/admin/gerenciar/mapas" }
    ]);
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className='flex items-center'>
        <h1 className='text-2xl font-bold'>Mapas</h1>
      </div>
    </div>
  )
}