import { Bell } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function NotificacionesPage() {
  return (
    <PagePlaceholder
      icon={Bell}
      title="Notificaciones"
      description="Alertas visuales de materiales y productos con stock por debajo del mínimo definido."
      sprint="Sprint 2"
    />
  );
}