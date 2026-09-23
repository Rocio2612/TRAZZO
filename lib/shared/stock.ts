// lib/shared/stock.ts
import { Prisma } from '@prisma/client';

/**
 * Aumenta el stock de un material (usado por gastos de compra)
 * Back 1 (Roci C) implementa esta función
 */
export async function aumentarStockMaterial(
  tx: Prisma.TransactionClient,
  materialId: number,
  cantidad: number,
  costoTotal: number
) {
  const material = await tx.material.findUnique({
    where: { id: materialId },
  });

  if (!material) throw new Error('Material no encontrado');

  // Calcular nuevo costo promedio ponderado
  const cantidadAnterior = Number(material.cantidad);
  const costoAnterior = Number(material.costo_unitario);
  const cantidadNueva = cantidadAnterior + cantidad;
  const costoTotalAnterior = cantidadAnterior * costoAnterior;
  const costoTotalNuevo = costoTotalAnterior + costoTotal;
  const costoPromedio = cantidadNueva > 0 ? costoTotalNuevo / cantidadNueva : 0;

  return tx.material.update({
    where: { id: materialId },
    data: {
      cantidad: { increment: cantidad },
      costo_unitario: costoPromedio,
    },
  });
}