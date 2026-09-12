import { TrendingDown } from "lucide-react";
import { PagePlaceholder } from "../../components/page-placeholder";

export default function GastosPage() {
  return (
    <PagePlaceholder
      icon={TrendingDown}
      title="Gastos"
      description="Registro de gastos variables (mercadería) y gastos extras (alquiler, envíos, otros)."
      sprint="Sprint 3"
    />
  );
}
