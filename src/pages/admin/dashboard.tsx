import { useHeader } from "@/hooks/use-header";
import { useEffect } from "react";

export default function AdminDashboard() {

  const { setPageBreadcrumbs } = useHeader();

  useEffect(() => {
    setPageBreadcrumbs([
      { title: "Dashboard", href: "/admin/dashboard" }
    ]);
  }, [])

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Dashboard do Administrador</h1>
      <p>Bem-vindo ao painel de controle do administrador!</p>
    </div>
  )
}