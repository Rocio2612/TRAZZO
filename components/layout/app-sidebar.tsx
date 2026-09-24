'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingBag,
  ClipboardList,
  DollarSign,
  TrendingDown,
  BarChart3,
  Bell,
  FlaskConical,
  Hammer,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  mostrarTaller: boolean;
  mostrarMostrador: boolean;
}

export function AppSidebar({ mostrarTaller, mostrarMostrador }: AppSidebarProps) {
  const pathname = usePathname();

  const items = [
    { title: 'Inicio', url: '/', icon: Home },
    ...(mostrarTaller
      ? [
          { title: 'Materiales', url: '/taller/materiales', icon: Package },
          { title: 'Recetas', url: '/taller/recetas', icon: FlaskConical },
          { title: 'Producción', url: '/taller/produccion', icon: Hammer },
        ]
      : []),
    ...(mostrarMostrador
      ? [
          { title: 'Productos', url: '/mostrador/productos', icon: ShoppingBag },
          { title: 'Pedidos', url: '/mostrador/pedidos', icon: ClipboardList },
          { title: 'Ventas', url: '/mostrador/ventas', icon: DollarSign },
          { title: 'Gastos', url: '/mostrador/gastos', icon: TrendingDown },
        ]
      : []),
    { title: 'Reporte', url: '/reporte', icon: BarChart3 },
    { title: 'Notificaciones', url: '/notificaciones', icon: Bell },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TRAZZO</span>
                <span className="truncate text-xs text-muted-foreground">
                  Gestión
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.url === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}