import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";  //  NUEVO

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trazzo - Gestión para Emprendedores',
  description: 'Sistema de gestión integral para emprendimientos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es" className={cn("font-sans", geist.variable)}>
        <body className={inter.className}>
          <TooltipProvider>       {/* NUEVO */}
            {children}
          </TooltipProvider>      {/*  NUEVO */}
        </body>
      </html>
    </ClerkProvider>
  );
}