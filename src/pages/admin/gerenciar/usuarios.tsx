import { useHeader } from "@/hooks/use-header";
import { useEffect } from "react";

export default function AdminUsuarios() {

  // =============== HOOKS   ===============
  const { setPageBreadcrumbs } = useHeader();

  useEffect(() => {
    // definir título da página
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Usuários", href: "/admin/gerenciar/usuarios" }
    ]);
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className='flex items-center'>
        <h1 className='text-2xl font-bold'>Usuários</h1>
      </div>
    </div>
  )
}