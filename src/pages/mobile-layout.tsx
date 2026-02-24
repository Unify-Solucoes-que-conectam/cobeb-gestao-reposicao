import { AppHeader } from "@/components/custom/mobile/app-header";
import { HeaderProvider } from "@/providers/mobile/HeaderProvider";
import { Outlet } from "react-router";

export default function MobileLayout() {
  return (
    <HeaderProvider>
      <AppHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2 p-6'>
          <Outlet />
        </div>
      </div>
    </HeaderProvider>
  )
}