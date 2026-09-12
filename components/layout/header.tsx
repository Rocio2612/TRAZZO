'use client';

import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

const titles: Record<string, string> = {
  '/': 'Inicio',
  '/materiales': 'Materiales',
  '/productos': 'Productos',
  '/pedidos': 'Pedidos',
  '/ventas': 'Ventas',
  '/gastos': 'Gastos',
  '/reporte': 'Reporte',
  '/notificaciones': 'Notificaciones',
};

export function Header() {
  const pathname = usePathname();
  const title = titles[pathname] ?? 'TRAZZO';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-base font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-8',
            },
          }}
        />
      </div>
    </header>
  );
}