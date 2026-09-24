import { listarMateriales } from '@/lib/taller/actions/materiales';
import { MaterialesTable } from './materiales-table';

export default async function MaterialesPage() {
  const materiales = await listarMateriales();

  // Prisma devuelve Decimal → hay que convertir a number para el Client Component
  const materialesSerializados = materiales.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    unidad_medida: m.unidad_medida,
    cantidad: Number(m.cantidad),
    stock_minimo: Number(m.stock_minimo),
    costo_unitario: Number(m.costo_unitario),
    descripcion: m.descripcion,
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Materiales</h1>
        <p className="text-sm text-muted-foreground">
          {materiales.length} materiales registrados
        </p>
      </div>

      <MaterialesTable materiales={materialesSerializados} />
    </div>
  );
}