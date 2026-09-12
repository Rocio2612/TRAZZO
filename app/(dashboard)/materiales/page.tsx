import { Package } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function MaterialesPage() {
  return (
    <PagePlaceholder
      icon={Package}
      title="Materiales"
      description="Gestión de insumos y materias primas: alta, edición, eliminación, búsqueda y filtro de stock bajo."
      sprint="Sprint 2"
    />
  );
}