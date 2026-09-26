import { listarVentas } from "@/lib/mostrador/actions/ventas";
import { listarProductosListos } from "@/lib/mostrador/actions/productos-listos";
import { VentasTable } from "./ventas-table";
import { NuevaVentaDialog } from "./nueva-venta-dialog";

export default async function VentasPage() {
  // Problema de colisión con codigo antiguo, se cambio por lo siguiente.
  // Ejecución secuencial para no colisionar conexiones en el pooler de Supabase
  const ventas = await listarVentas();
  const productos = await listarProductosListos();

  // Prisma devuelve Decimal → hay que convertir a number para el Client Component
  const ventasSerializadas = ventas.map((v) => ({
    id: v.id,
    cliente: v.cliente,
    fecha: v.fecha.toISOString(),
    monto_total: Number(v.monto_total),
    cantidadItems: v.detalles.length,
  }));

  // Solo se puede vender lo que tiene stock disponible
  const productosDisponibles = productos
    .filter((p) => p.stock_actual > 0)
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio_venta: Number(p.precio_venta),
      stock_actual: p.stock_actual,
    }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <NuevaVentaDialog productos={productosDisponibles} />
      </div>

      <VentasTable ventas={ventasSerializadas} />
    </div>
  );
}
