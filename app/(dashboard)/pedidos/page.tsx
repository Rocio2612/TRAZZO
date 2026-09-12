import { ClipboardList } from "lucide-react";
import { PagePlaceholder } from "../../components/page-placeholder";

export default function PedidosPage() {
  return (
    <PagePlaceholder
      icon={ClipboardList}
      title="Pedidos"
      description="Gestión de pedidos activos, entregados y pendientes."
      sprint="Sprint 3"
    />
  );
}
