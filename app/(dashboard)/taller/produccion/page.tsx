import { listarProducciones } from '@/lib/taller/actions/producciones';
import { ProduccionTable } from './produccion-table';

export default async function ProduccionPage() {
  const producciones = await listarProducciones();

  // Serializar Decimals y fechas para el Client Component
  const produccionesSerializadas = producciones.map((p) => ({
    id: p.id,
    cantidad: p.cantidad,
    fecha: p.fecha.toISOString(),
    receta: {
      id: p.receta.id,
      nombre: p.receta.nombre,
      materiales: p.receta.materiales.map((rm) => ({
        cantidad_necesaria: Number(rm.cantidad_necesaria),
        material: {
          nombre: rm.material.nombre,
          costo_unitario: Number(rm.material.costo_unitario),
        },
      })),
    },
    productoListo: {
      id: p.productoListo.id,
      nombre: p.productoListo.nombre,
    },
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Historial de Producción</h1>
        <p className="text-sm text-muted-foreground">
          {producciones.length}{' '}
          {producciones.length === 1 ? 'tanda registrada' : 'tandas registradas'}
        </p>
      </div>

      <ProduccionTable producciones={produccionesSerializadas} />
    </div>
  );
}