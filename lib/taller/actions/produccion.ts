// lib/taller/actions/produccion.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ==========================================
// SCHEMA DE VALIDACIÓN
// ==========================================

const fabricarSchema = z.object({
  receta_id: z.number().positive(),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  producto_listo_id: z.number().positive('El producto listo es obligatorio'),
});

// ==========================================
// HU-05: LISTAR PRODUCCIONES (Historial)
// ==========================================

export async function listarProducciones() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  return prisma.produccion.findMany({
    where: { usuario_id: userId },
    include: {
      receta: {
        select: {
          id: true,
          nombre: true,
        },
      },
      productoListo: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    orderBy: { fecha: 'desc' },
  });
}

// ==========================================
// HU-06: FABRICAR Y DESCONTAR STOCK
// ==========================================

export async function fabricarProducto(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const datos = fabricarSchema.parse({
    receta_id: Number(formData.get('receta_id')),
    cantidad: Number(formData.get('cantidad')),
    producto_listo_id: Number(formData.get('producto_listo_id')),
  });

  // Ejecutar todo en una transacción
  await prisma.$transaction(async (tx) => {
    // 1. Buscar la receta con sus materiales
    const receta = await tx.receta.findUnique({
      where: { id: datos.receta_id, usuario_id: userId },
      include: {
        materiales: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!receta) throw new Error('Receta no encontrada');
    if (receta.materiales.length === 0) {
      throw new Error('La receta no tiene materiales asociados');
    }

    // 2. Validar que hay suficiente stock de cada material
    for (const rm of receta.materiales) {
      const cantidadNecesaria = Number(rm.cantidad_necesaria) * datos.cantidad;
      const stockActual = Number(rm.material.cantidad);

      if (stockActual < cantidadNecesaria) {
        throw new Error(
          `Stock insuficiente de "${rm.material.nombre}". ` +
          `Necesitás ${cantidadNecesaria} ${rm.material.unidad_medida}, ` +
          `pero solo hay ${stockActual}.`
        );
      }
    }

    // 3. Descontar los materiales
    for (const rm of receta.materiales) {
      const cantidadDescontar = Number(rm.cantidad_necesaria) * datos.cantidad;

      await tx.material.update({
        where: { id: rm.material_id },
        data: {
          cantidad: { decrement: cantidadDescontar },
        },
      });
    }

    // 4. Aumentar el stock del producto listo
    await tx.productoListo.update({
      where: { id: datos.producto_listo_id, usuario_id: userId },
      data: {
        stock_actual: { increment: datos.cantidad },
      },
    });

    // 5. Registrar la producción
    await tx.produccion.create({
      data: {
        usuario_id: userId,
        receta_id: datos.receta_id,
        producto_listo_id: datos.producto_listo_id,
        cantidad: datos.cantidad,
        fecha: new Date(),
      },
    });
  });

  revalidatePath('/taller/produccion');
  revalidatePath('/taller/materiales');
  revalidatePath('/taller/recetas');
}

// ==========================================
// VALIDAR STOCK PREVIO (sin descontar)
// ==========================================

export async function validarStockReceta(recetaId: number, cantidad: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const receta = await prisma.receta.findUnique({
    where: { id: recetaId, usuario_id: userId },
    include: {
      materiales: {
        include: {
          material: true,
        },
      },
    },
  });

  if (!receta) throw new Error('Receta no encontrada');

  const faltantes = receta.materiales
    .map((rm) => {
      const necesario = Number(rm.cantidad_necesaria) * cantidad;
      const actual = Number(rm.material.cantidad);
      return {
        material: rm.material.nombre,
        necesario,
        actual,
        falta: necesario > actual ? necesario - actual : 0,
      };
    })
    .filter((m) => m.falta > 0);

  return {
    puedeFabricar: faltantes.length === 0,
    faltantes,
  };
}