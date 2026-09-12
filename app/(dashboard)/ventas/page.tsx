import { DollarSign } from "lucide-react";
import { PagePlaceholder } from "../../components/page-placeholder";

export default function VentasPage() {
  return (
    <PagePlaceholder
      icon={DollarSign}
      title="Ventas"
      description="Registro de ventas directas y desde pedidos, con historial completo."
      sprint="Sprint 3"
    />
  );
}
