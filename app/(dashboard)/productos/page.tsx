import { listarProductosListos } from "@/lib/mostrador/actions/productos-listos";
import { ProductosTable } from "./productos-table";
import { NuevoProductoDialog } from "./nuevo-producto-dialog";

export default async function ProductosListosPage() {
  const productos = await listarProductosListos();

  // Prisma devuelve Decimal → hay que convertir a number para el Client Component
  const productosSerializados = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio_venta: Number(p.precio_venta),
    stock_actual: p.stock_actual,
    stock_minimo: p.stock_minimo,
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Cabecera con titulo, contador y boton de alta */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {productos.length} productos registrados
          </p>
        </div>

        {/* 2. Aca mostramos el boton negro con el modal */}
        <NuevoProductoDialog />
      </div>

      <ProductosTable productos={productosSerializados} />
    </div>
  );
}
