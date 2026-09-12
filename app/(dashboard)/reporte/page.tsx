import { BarChart3 } from "lucide-react";
import { PagePlaceholder } from "../../components/page-placeholder";

export default function ReportePage() {
  return (
    <PagePlaceholder
      icon={BarChart3}
      title="Reporte"
      description="Vista mensual con total de ventas, total de gastos y ganancia neta del mes en curso."
      sprint="Sprint 3"
    />
  );
}
