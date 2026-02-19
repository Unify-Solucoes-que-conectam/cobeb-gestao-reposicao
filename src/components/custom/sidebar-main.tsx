import { ChevronRight, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Menu } from "@/types/app";
import DynamicIcon from "./dynamic-icon";
import dayjs from "@/lib/dayjs";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export const SidebarMain = () => {

  const { open } = useSidebar();
  const { loading, menus } = useAuth();

  if (!menus) return;

  const recursiveMenu = (menu: Menu) => {
    if (menu.sub_menus && menu.sub_menus.length > 0) {
      return (
        <Collapsible key={menu.id} asChild className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton openOnClick tooltip={menu.titulo}>
                {menu.icone && <DynamicIcon iconName={menu.icone} />}

                <div className="flex items-center justify-between gap-1 flex-1 min-w-0">
                  <span
                    className="text-ellipsis whitespace-nowrap overflow-hidden min-w-0"
                    title={menu.titulo}
                  >
                    {menu.titulo}
                  </span>

                  {dayjs().diff(dayjs(menu.created_at), "day") < 5 && (
                    <Badge className="text-[0.55rem] px-1 shrink-0">
                      Novo
                    </Badge>
                  )}
                </div>

                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {menu.sub_menus.map((submenu) => recursiveMenu(submenu))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuSubItem key={menu.id}>
        <SidebarMenuSubButton asChild>
          <Link to={menu.rota || "#"}>
            {menu.icone && <DynamicIcon iconName={menu.icone} />}

            <div className="flex items-center justify-between gap-1 flex-1 min-w-0">
              <span
                className="text-ellipsis whitespace-nowrap overflow-hidden min-w-0"
                title={menu.titulo}
              >
                {menu.titulo}
              </span>

              {dayjs().diff(dayjs(menu.created_at), "day") < 5 && (
                <Badge className="text-[0.55rem] px-1 shrink-0">
                  Novo
                </Badge>
              )}
            </div>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center w-full h-full">
        <LoaderCircle
          className={cn("animate-spin text-muted-foreground", open ? "w-12 h-12 " : "w-6 h-6")}
        />
        {open && "Carregando Menus..."}
      </div>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menus</SidebarGroupLabel>

      <SidebarMenu>{menus.map((menu) => recursiveMenu(menu))}</SidebarMenu>
    </SidebarGroup>
  );
};
