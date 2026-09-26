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