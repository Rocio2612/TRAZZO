// lib/shared/actions/onboarding.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ==========================================
// SCHEMA DE VALIDACIÓN
// ==========================================

const negocioSchema = z.object({
  nombre: z.string().min(1, 'El nombre del negocio es obligatorio'),
  tipo: z.enum(['TALLER', 'MOSTRADOR', 'AMBOS'], {
    message: 'El tipo de negocio es obligatorio',
  }),
});

// ==========================================
// CREAR NEGOCIO (ONBOARDING)
// ==========================================

export async function crearNegocio(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // Validar los datos del formulario
  const datos = negocioSchema.parse({
    nombre: formData.get('nombre'),
    tipo: formData.get('tipo'),
  });

  // Verificar si el usuario ya tiene un negocio
  const negocioExistente = await prisma.negocio.findUnique({
    where: { usuario_id: userId },
  });

  if (negocioExistente) {
    // Si ya tiene negocio, redirigir al dashboard
    redirect('/dashboard');
  }

  // Crear el negocio asociado al usuario de Clerk
  await prisma.negocio.create({
    data: {
      usuario_id: userId,
      nombre: datos.nombre,
      tipo: datos.tipo,
    },
  });

  // Revalidar rutas para que se actualice el layout
  revalidatePath('/dashboard');
  revalidatePath('/onboarding');

  // Redirigir al dashboard
  redirect('/dashboard');
}

// ==========================================
// OBTENER NEGOCIO DEL USUARIO
// ==========================================

export async function obtenerNegocio() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  return prisma.negocio.findUnique({
    where: { usuario_id: userId },
  });
}

// ==========================================
// VERIFICAR SI TIENE NEGOCIO
// ==========================================

export async function tieneNegocio(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const negocio = await prisma.negocio.findUnique({
    where: { usuario_id: userId },
    select: { id: true },
  });

  return !!negocio;
}