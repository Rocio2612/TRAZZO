// lib/taller/actions/materiales.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const materialSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  unidad_medida: z.enum(['UNIDAD', 'KG', 'LITROS', 'METROS']),
  cantidad: z.number().nonnegative('La cantidad debe ser >= 0'),
  stock_minimo: z.number().nonnegative('El stock mínimo debe ser >= 0'),
  costo_unitario: z.number().positive('El costo debe ser > 0'),
  descripcion: z.string().optional(),
});

export async function crearMaterial(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const datos = materialSchema.parse({
    nombre: formData.get('nombre'),
    unidad_medida: formData.get('unidad_medida'),
    cantidad: Number(formData.get('cantidad')),
    stock_minimo: Number(formData.get('stock_minimo')),
    costo_unitario: Number(formData.get('costo_unitario')),
    descripcion: formData.get('descripcion') || undefined,
  });

  await prisma.material.create({
    data: {
      ...datos,
      usuario_id: userId,
    },
  });

  revalidatePath('/taller/materiales');
}

export async function listarMateriales() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  return prisma.material.findMany({
    where: { usuario_id: userId },
    orderBy: { nombre: 'asc' },
  });
}

export async function editarMaterial(id: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const datos = materialSchema.parse({
    nombre: formData.get('nombre'),
    unidad_medida: formData.get('unidad_medida'),
    cantidad: Number(formData.get('cantidad')),
    stock_minimo: Number(formData.get('stock_minimo')),
    costo_unitario: Number(formData.get('costo_unitario')),
    descripcion: formData.get('descripcion') || undefined,
  });

  await prisma.material.update({
    where: { id, usuario_id: userId },
    data: datos,
  });

  revalidatePath('/taller/materiales');
}

export async function eliminarMaterial(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // HU-07: No eliminar si está en uso en una receta
  const enUso = await prisma.recetaMaterial.findFirst({
    where: { material_id: id },
  });

  if (enUso) {
    throw new Error('No se puede eliminar: el material está en uso en una receta');
  }

  await prisma.material.delete({
    where: { id, usuario_id: userId },
  });

  revalidatePath('/taller/materiales');
}

export async function materialesConStockBajo() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  return prisma.material.findMany({
    where: {
      usuario_id: userId,
      cantidad: { lte: prisma.material.fields.stock_minimo },
    },
  });
}