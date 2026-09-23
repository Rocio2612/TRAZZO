// lib/taller/actions/recetas.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ==========================================
// SCHEMA DE VALIDACIÓN
// ==========================================

const materialEnRecetaSchema = z.object({
  material_id: z.number().positive(),
  cantidad_necesaria: z.number().positive('La cantidad debe ser mayor a 0'),
});

const recetaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  materiales: z.array(materialEnRecetaSchema).min(1, 'Debe agregar al menos un material'),
});

// ==========================================
// CREAR RECETA
// ==========================================

export async function crearReceta(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // Parsear los materiales (vienen como JSON string)
  const materialesRaw = formData.get('materiales') as string;
  const materiales = JSON.parse(materialesRaw);

  const datos = recetaSchema.parse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion') || undefined,
    materiales,
  });

  // Crear la receta con sus materiales en una transacción
  await prisma.$transaction(async (tx) => {
    const receta = await tx.receta.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        usuario_id: userId,
      },
    });

    // Crear los materiales de la receta
    for (const mat of datos.materiales) {
      await tx.recetaMaterial.create({
        data: {
          receta_id: receta.id,
          material_id: mat.material_id,
          cantidad_necesaria: mat.cantidad_necesaria,
        },
      });
    }
  });

  revalidatePath('/taller/recetas');
}

// ==========================================
// LISTAR RECETAS
// ==========================================

export async function listarRecetas() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  return prisma.receta.findMany({
    where: { usuario_id: userId },
    include: {
      materiales: {
        include: {
          material: true,
        },
      },
      productosListos: true,
      pedidoDetalles: true,
    },
    orderBy: { nombre: 'asc' },
  });
}

// ==========================================
// CALCULAR COSTO DE RECETA
// ==========================================

export async function calcularCostoReceta(recetaId: number) {
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

  // Suma de cantidad_necesaria * costo_unitario de cada material
  const costoTotal = receta.materiales.reduce((total, rm) => {
    const cantidad = Number(rm.cantidad_necesaria);
    const costo = Number(rm.material.costo_unitario);
    return total + cantidad * costo;
  }, 0);

  return costoTotal;
}

// ==========================================
// EDITAR RECETA
// ==========================================

export async function editarReceta(id: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // Verificar que la receta pertenece al usuario
  const recetaExistente = await prisma.receta.findUnique({
    where: { id, usuario_id: userId },
  });

  if (!recetaExistente) throw new Error('Receta no encontrada');

  // Parsear los materiales
  const materialesRaw = formData.get('materiales') as string;
  const materiales = JSON.parse(materialesRaw);

  const datos = recetaSchema.parse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion') || undefined,
    materiales,
  });

  // Actualizar la receta y sus materiales en una transacción
  await prisma.$transaction(async (tx) => {
    // Actualizar la receta
    await tx.receta.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
      },
    });

    // Eliminar los materiales viejos
    await tx.recetaMaterial.deleteMany({
      where: { receta_id: id },
    });

    // Crear los nuevos materiales
    for (const mat of datos.materiales) {
      await tx.recetaMaterial.create({
        data: {
          receta_id: id,
          material_id: mat.material_id,
          cantidad_necesaria: mat.cantidad_necesaria,
        },
      });
    }
  });

  revalidatePath('/taller/recetas');
}

// ==========================================
// ELIMINAR RECETA
// ==========================================

export async function eliminarReceta(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // HU-09: Bloquear eliminación si está en uso por un producto listo
  const enUsoProducto = await prisma.productoListo.findFirst({
    where: { receta_id: id },
  });

  if (enUsoProducto) {
    throw new Error('No se puede eliminar: la receta está asociada a un producto listo');
  }

  // HU-09: Bloquear eliminación si está en uso por un pedido pendiente
  const enUsoPedido = await prisma.pedidoDetalle.findFirst({
    where: {
      receta_id: id,
      pedido: {
        estado_pedido: 'PENDIENTE',
      },
    },
  });

  if (enUsoPedido) {
    throw new Error('No se puede eliminar: la receta está asociada a un pedido pendiente');
  }

  // Eliminar la receta (los RecetaMaterial se eliminan en cascada)
  await prisma.receta.delete({
    where: { id, usuario_id: userId },
  });

  revalidatePath('/taller/recetas');
}