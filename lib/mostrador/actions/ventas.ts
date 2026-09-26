// Ruta: lib/mostrador/actions/ventas.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ESQUEMAS DE VALIDACIÓN ZOD

const itemVentaSchema = z.object({
  producto_listo_id: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
});

const registrarVentaSchema = z.object({
  cliente: z.string().trim().optional(),
  items: z.array(itemVentaSchema).min(1, 'El carrito debe tener al menos un producto'),
});

export type RegistrarVentaInput = z.infer<typeof registrarVentaSchema>;

// 1. REGISTRAR VENTA (TRANSACCIÓN ATÓMICA CON DESCUENTO DE STOCK)

export async function registrarVenta(input: RegistrarVentaInput) {
  // 1.1. Verificación de sesión activa
  const { userId } = await auth();
  if (!userId) {
    throw new Error('No autorizado: Se requiere iniciar sesión.');
  }

  // 1.2. Validación de formato de datos
  const datosValidados = registrarVentaSchema.parse(input);

  // 1.3. Ejecución atómica en base de datos
  // Si cualquiera de las operaciones falla o falta stock, todo se revierte (rollback).
  const ventaRealizada = await prisma.$transaction(async (tx) => {
    let montoTotalVenta = 0;
    const detallesParaGuardar = [];

    for (const item of datosValidados.items) {
      // Consultamos el producto y verificamos que pertenezca al usuario
      const producto = await tx.productoListo.findFirst({
        where: {
          id: item.producto_listo_id,
          usuario_id: userId,
        },
      });

      if (!producto) {
        throw new Error(`El producto con ID ${item.producto_listo_id} no existe o no te pertenece.`);
      }

      // Validación estricta de stock disponible
      if (producto.stock_actual < item.cantidad) {
        throw new Error(
          `Stock insuficiente para "${producto.nombre}". Disponibles: ${producto.stock_actual}, solicitados: ${item.cantidad}.`
        );
      }

      const precioUnitario = Number(producto.precio_venta);
      const subtotal = precioUnitario * item.cantidad;
      montoTotalVenta += subtotal;

      // Preparamos el renglón contable
      detallesParaGuardar.push({
        producto_listo_id: producto.id,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
      });

      // Descontamos las unidades vendidas del stock del producto
      await tx.productoListo.update({
        where: { id: producto.id },
        data: {
          stock_actual: {
            decrement: item.cantidad,
          },
        },
      });
    }

    // Insertamos la cabecera de la venta junto con sus detalles en una sola llamada
    const nuevaVenta = await tx.venta.create({
      data: {
        usuario_id: userId,
        cliente: datosValidados.cliente || null,
        monto_total: montoTotalVenta,
        origen: 'DIRECTA',
        // Usamos la sintaxis relacional de Prisma con connect
        detalles: {
          create: detallesParaGuardar.map((d) => ({
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            productoListo: {
              connect: { id: d.producto_listo_id },
            },
          })),
        },
      },
      include: {
        detalles: true,
      },
    });

    return nuevaVenta;
  });

  // 4. Refrescamos las pantallas afectadas
  revalidatePath('/mostrador/ventas');
  revalidatePath('/productos');
  revalidatePath('/');

  return {
    success: true,
    ventaId: ventaRealizada.id,
  };
}

// 2. LISTAR VENTAS (HISTORIAL PARA LA TABLA)

export async function listarVentas() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('No autorizado');
  }

  return await prisma.venta.findMany({
    where: {
      usuario_id: userId,
    },
    include: {
      detalles: true, // Requerido por page.tsx para calcular cantidadItems
    },
    orderBy: {
      fecha: 'desc', // Las ventas más recientes aparecen arriba
    },
  });
}