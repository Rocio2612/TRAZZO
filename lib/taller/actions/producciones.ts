// lib/taller/actions/producciones.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function listarProducciones() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  return prisma.produccion.findMany({
    where: { usuario_id: userId },
    include: {
      receta: {
        include: {
          materiales: {
            include: {
              material: true,
            },
          },
        },
      },
      productoListo: true,
    },
    orderBy: { fecha: 'desc' },
  });
}

/**
 * ⚠️ STUB — Implementación pendiente por Back 1 (Rocío C) / Back 2 (Aldi).
 *
 * Esta función es un placeholder para que el front compile.
 * La transacción atómica real debe:
 *   1. Verificar stock suficiente de cada material.
 *   2. Descontar los materiales del inventario.
 *   3. Sumar stock al producto listo.
 *   4. Registrar la producción en la tabla Produccion.
 * Todo dentro de un prisma.$transaction.
 */
export async function fabricarLote(
  recetaId: number,
  cantidad: number,
  productoListoId: number
) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // Validaciones básicas (frontend ya las hace, pero por seguridad)
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  // Parámetros reservados para la transacción real (pendiente por Backend)
  void recetaId;
  void productoListoId;

  // ⚠️ TODO: Reemplazar por la transacción atómica real (Back 1 / Back 2)
  throw new Error(
    'Fabricar lote: función pendiente de implementación por Backend.'
  );
}