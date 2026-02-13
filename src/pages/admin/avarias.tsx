import { useHeader } from "@/hooks/use-header";
import React, { useEffect } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { MapPinIcon, PackageIcon, TriangleAlertIcon, UsersIcon } from "lucide-react";

interface Dashboard {
  total: number
  title: string
  icon: React.ReactNode
  className?: string
}

export default function AdminAvarias() {

  const { setPageBreadcrumbs } = useHeader();
  const { theme } = useTheme();

  useEffect(() => {
    setPageBreadcrumbs([
      { title: "Avarias", href: "/admin/avarias" }
    ]);
  }, [])

  const dashboards: Dashboard[] = [
    {
      total: 150,
      title: "Total Avarias",
      icon: <TriangleAlertIcon size={20} />,
      className: "bg-red-400/20 text-red-500"
    },
    {
      total: 150,
      title: "Motoristas",
      icon: <UsersIcon size={20} />,
      className: "bg-blue-400/20 text-blue-500"
    },
    {
      total: 150,
      title: "Produtos",
      icon: <PackageIcon size={20} />,
      className: "bg-orange-400/20 text-orange-500"
    },
    {
      total: 150,
      title: "Rotas",
      icon: <MapPinIcon size={20} />,
      className: "bg-green-400/20 text-green-500"
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold mb-4'>Avarias</h1>
        <Select defaultValue="today">
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className={cn({ "bg-white text-dark": theme !== "dark" })}>
            <SelectGroup>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        {
          dashboards.map((dash, index) => (
            <Card key={index} className="flex items-center w-full">
              <CardHeader className="p-4 pr-0">
                <div className={cn("p-2 rounded-md flex", dash.className)}>
                  {dash.icon}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-center h-full p-4">
                <p className="text-xl font-bold">{dash.total}</p>
                <p className="text-sm text-muted-foreground">{dash.title}</p>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div >
  )
}