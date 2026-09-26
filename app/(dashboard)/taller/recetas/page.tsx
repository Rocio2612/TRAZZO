import { listarRecetas } from '@/lib/taller/actions/recetas';
import { listarMateriales } from '@/lib/taller/actions/materiales';
import { listarProductosListos } from '@/lib/mostrador/actions/productos-listos';
import { RecetasTable } from './recetas-table';

export default async function RecetasPage() {
  const [recetas, materiales, productos] = await Promise.all([
    listarRecetas(),
    listarMateriales(),
    listarProductosListos(),
  ]);

  // Serializar Decimals de Prisma a number (no se pueden pasar al Client Component)
  const recetasSerializadas = recetas.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    materiales: r.materiales.map((rm) => ({
      id: rm.id,
      material_id: rm.material_id,
      cantidad_necesaria: Number(rm.cantidad_necesaria),
      material: {
        id: rm.material.id,
        nombre: rm.material.nombre,
        unidad_medida: rm.material.unidad_medida,
        costo_unitario: Number(rm.material.costo_unitario),
      },
    })),
    cantidadProductosListos: r.productosListos.length,
    cantidadPedidos: r.pedidoDetalles.length,
  }));

  // Serializar materiales disponibles
  const materialesDisponibles = materiales.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    unidad_medida: m.unidad_medida,
    costo_unitario: Number(m.costo_unitario),
  }));

  // Serializar productos listos disponibles (para el modal de Fabricar)
  const productosDisponibles = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    stock_actual: p.stock_actual,
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recetas</h1>
        <p className="text-sm text-muted-foreground">
          {recetas.length} recetas registradas
        </p>
      </div>

      <RecetasTable
        recetas={recetasSerializadas}
        materialesDisponibles={materialesDisponibles}
        productosDisponibles={productosDisponibles}
      />
    </div>
  );
}