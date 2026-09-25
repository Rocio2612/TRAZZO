import { listarPedidos } from "@/lib/mostrador/actions/pedidos";
import { PedidosTable } from "./pedidos-table";
import { NuevoPedidoDialog } from "./nuevo-pedido-dialog";

export default async function PedidosPage() {
  const pedidos = await listarPedidos();

  // Prisma devuelve Decimal → hay que convertir a number para el Client Component
  const pedidosSerializados = pedidos.map((p) => ({
    id: p.id,
    numero: p.numero,
    cliente: p.cliente,
    fecha: p.fecha.toISOString(),
    estado_pago: p.estado_pago,
    estado_pedido: p.estado_pedido,
    monto_total: Number(p.monto_total),
    monto_senia: Number(p.monto_senia),
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <NuevoPedidoDialog />
      </div>

      <PedidosTable pedidos={pedidosSerializados} />
    </div>
  );
}
