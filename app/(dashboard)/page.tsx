import { Home } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function InicioPage() {
  return (
    <PagePlaceholder
      icon={Home}
      title="Inicio"
      description="Panel principal con resumen de tu negocio: pedidos pendientes, stock bajo, ventas del mes y más."
      sprint="Sprint 2"
    />
  );
}