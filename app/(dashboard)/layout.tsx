import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const negocio = await prisma.negocio.findUnique({
    where: { usuario_id: userId },
  });

  if (!negocio) redirect('/onboarding');

  const mostrarTaller =
    negocio.tipo === 'TALLER' || negocio.tipo === 'AMBOS';
  const mostrarMostrador =
    negocio.tipo === 'MOSTRADOR' || negocio.tipo === 'AMBOS';

  return (
    <SidebarProvider>
      <AppSidebar
        mostrarTaller={mostrarTaller}
        mostrarMostrador={mostrarMostrador}
      />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}