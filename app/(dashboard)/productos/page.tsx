import { ShoppingBag } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function ProductosPage() {
  return (
    <PagePlaceholder
      icon={ShoppingBag}
      title="Productos"
      description="Catálogo de productos armados con materiales y productos listos para vender, con su propio stock."
      sprint="Sprint 2"
    />
  );
}