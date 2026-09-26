//Ruta: lib/taller/actions/producciones.ts
// problemas con el tipo de formato de los atributos, se usa snake_case.
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. LISTAR HISTORIAL DE PRODUCCIÓN

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

// 2. FABRICAR LOTE (HU-06: TRANSACCIÓN ATÓMICA DE PRODUCCIÓN)

// lib/taller/actions/producciones.ts

export async function fabricarLote(
  recetaId: number,
  cantidad: number,
  productoListoId: number
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('No autorizado: Se requiere iniciar sesión.');
  }

  if (!cantidad || cantidad <= 0 || !Number.isInteger(cantidad)) {
    throw new Error('La cantidad de lotes a fabricar debe ser un número entero mayor a 0.');
  }

  const produccionRealizada = await prisma.$transaction(async (tx) => {
    // 1. Buscar la receta del usuario
    const receta = await tx.receta.findFirst({
      where: {
        id: recetaId,
        usuario_id: userId,
      },
      include: {
        materiales: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!receta) {
      throw new Error(`La receta con ID ${recetaId} no existe o no te pertenece.`);
    }

    if (!receta.materiales || receta.materiales.length === 0) {
      throw new Error(`La receta "${receta.nombre}" no tiene materiales asociados.`);
    }

    // 2. Buscar el producto terminado del usuario
    const productoDestino = await tx.productoListo.findFirst({
      where: {
        id: productoListoId,
        usuario_id: userId,
      },
    });

    if (!productoDestino) {
      throw new Error(`El producto terminado con ID ${productoListoId} no existe o no te pertenece.`);
    }

    // 3. Validar stock de cada insumo
    for (const item of receta.materiales) {
      const cantidadRequerida = Number(item.cantidad_necesaria) * cantidad;
      const stockDisponible = Number(item.material.cantidad);

      if (stockDisponible < cantidadRequerida) {
        throw new Error(
          `Stock insuficiente de "${item.material.nombre}". Necesitás ${cantidadRequerida} ${item.material.unidad_medida}, pero solo hay ${stockDisponible} en taller.`
        );
      }
    }

    // 4. Descontar materiales de taller
    for (const item of receta.materiales) {
      const cantidadRequerida = Number(item.cantidad_necesaria) * cantidad;

      await tx.material.update({
        where: { id: item.material_id },
        data: {
          cantidad: {
            decrement: cantidadRequerida,
          },
        },
      });
    }

    // 5. Sumar unidades al producto terminado
    await tx.productoListo.update({
      where: { id: productoDestino.id },
      data: {
        stock_actual: {
          increment: cantidad,
        },
      },
    });

    // 6. Registrar en la tabla producciones
    const nuevaProduccion = await tx.produccion.create({
      data: {
        usuario_id: userId,
        receta_id: receta.id,
        producto_listo_id: productoDestino.id,
        cantidad: cantidad,
      },
    });

    return nuevaProduccion;
  });

  revalidatePath('/taller/produccion');
  revalidatePath('/taller/recetas');
  revalidatePath('/taller/materiales');
  revalidatePath('/productos');
  revalidatePath('/');

  return {
    success: true,
    produccionId: produccionRealizada.id,
  };
}