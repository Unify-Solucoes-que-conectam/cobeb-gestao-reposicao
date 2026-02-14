import { useHeader } from "@/hooks/use-header";
import { useEffect } from "react";

export default function AdminImportacoes() {

  // =============== HOOKS   ===============
  const { setPageBreadcrumbs } = useHeader();

  useEffect(() => {

    // definir título da página
    setPageBreadcrumbs([
      { title: "Importações", href: "/admin/importacoes" }
    ]);
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className='flex items-center'>
        <h1 className='text-2xl font-bold'>Importações</h1>
      </div>
    </div>
  );
}