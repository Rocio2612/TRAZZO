// lib/shared/actions/onboarding.ts
'use server';

// CORRECCIÓN CLAVE: Se importa currentUser de Clerk para obtener el perfil del usuario (email, nombre)
// y asegurar su inserción en Supabase antes de crear el negocio.

import { auth, currentUser } from '@clerk/nextjs/server';
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

  // MOTIVO DE LA CORRECCIÓN TÉCNICA (Error: Foreign key constraint violated):
  // En schema.prisma, la tabla `negocios` tiene una relación foránea directa con `usuarios`: usuario_id String @unique -> referencias a usuarios(id)

  // Si intentamos hacer `prisma.negocio.create()` pasando el ID de Clerk sin que ese ID exista previamente como fila en la tabla `usuarios` de Supabase, PostgreSQL
  // aborta la transacción con la violación de clave foránea `negocios_usuario_id_fkey`.

  // SOLUCIÓN:
  // Obtenemos los datos del usuario logueado en Clerk (email y nombre) y ejecutamos un `upsert` en la tabla `usuarios`. Si ya existe lo mantiene actualizado;
  // si es nuevo, lo inserta primero. Así garantizamos la integridad relacional.
 
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
  const nombreCompleto = [clerkUser?.firstName, clerkUser?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || clerkUser?.username || 'Emprendedor';

  await prisma.usuario.upsert({
    where: { id: userId },
    update: {
      email: email,
      nombre: nombreCompleto,
    },
    create: {
      id: userId,
      email: email,
      nombre: nombreCompleto,
    },
  });

  // Verificar si el usuario ya tiene un negocio registrado
  const negocioExistente = await prisma.negocio.findUnique({
    where: { usuario_id: userId },
  });

  if (negocioExistente) {
    // Si ya tiene negocio, redirigir al dashboard
    redirect('/');
  }

  // Ahora sí: Crear el negocio asociado al usuario que ya existe en Supabase
  await prisma.negocio.create({
    data: {
      usuario_id: userId,
      nombre: datos.nombre,
      tipo: datos.tipo,
    },
  });

  // Revalidar rutas para que se actualice el layout y la sesión
  revalidatePath('/dashboard');
  revalidatePath('/onboarding');

  // Redirigir al dashboard
  redirect('/');
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