// lib/mostrador/actions/pedidos.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ==========================================
// SCHEMA DE VALIDACIÓN
// ==========================================

const pedidoDetalleSchema = z.object({
  producto_listo_id: z.number().positive().optional(),
  receta_id: z.number().positive().optional(),
  cantidad: z.number().int().positive(),
  precio_unitario: z.number().nonnegative(),
});

const pedidoSchema = z.object({
  cliente: z.string().min(1, 'El cliente es obligatorio'),
  estado_pago: z.enum(['NO_PAGADO', 'PARCIAL', 'PAGADO_TOTAL']),
  estado_pedido: z.enum(['PENDIENTE', 'CANCELADO', 'ENTREGADO']),
  descripcion: z.string().optional(),
  monto_total: z.number().nonnegative(),
  detalles: z.array(pedidoDetalleSchema).min(1, 'Debe agregar al menos un producto'),
});

// ==========================================
// CREAR PEDIDO
// ==========================================

export async function crearPedido(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  const detallesRaw = formData.get('detalles') as string;
  const detalles = JSON.parse(detallesRaw);

  const datos = pedidoSchema.parse({
    cliente: formData.get('cliente'),
    estado_pago: formData.get('estado_pago'),
    estado_pedido: formData.get('estado_pedido'),
    descripcion: formData.get('descripcion') || undefined,
    monto_total: Number(formData.get('monto_total')),
    detalles,
  });

  // REGLA DE NEGOCIO: No se puede entregar sin pagar
  if (datos.estado_pedido === 'ENTREGADO' && datos.estado_pago !== 'PAGADO_TOTAL') {
    throw new Error('El pedido debe estar pagado para que se entregue');
  }

  // Generar número correlativo por usuario
  const ultimoPedido = await prisma.pedido.findFirst({
    where: { usuario_id: userId },
    orderBy: { numero: 'desc' },
    select: { numero: true },
  });

  const nuevoNumero = (ultimoPedido?.numero ?? 0) + 1;

  // Crear el pedido en una transacción
  await prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        usuario_id: userId,
        numero: nuevoNumero,
        cliente: datos.cliente,
        estado_pago: datos.estado_pago,
        estado_pedido: datos.estado_pedido,
        descripcion: datos.descripcion,
        monto_total: datos.monto_total,
      },
    });

    // Crear los detalles
    for (const det of datos.detalles) {
      await tx.pedidoDetalle.create({
        data: {
          pedido_id: pedido.id,
          producto_listo_id: det.producto_listo_id,
          receta_id: det.receta_id,
          cantidad: det.cantidad,
          precio_unitario: det.precio_unitario,
        },
      });
    }

    // Si está "pagado total" + "entregado", generar Venta automática
    if (datos.estado_pago === 'PAGADO_TOTAL' && datos.estado_pedido === 'ENTREGADO') {
      const venta = await tx.venta.create({
        data: {
          usuario_id: userId,
          pedido_id: pedido.id,
          cliente: datos.cliente,
          monto_total: datos.monto_total,
          origen: 'PEDIDO',
        },
      });

      for (const det of datos.detalles) {
        if (det.producto_listo_id) {
          await tx.ventaDetalle.create({
            data: {
              venta_id: venta.id,
              producto_listo_id: det.producto_listo_id,
              cantidad: det.cantidad,
              precio_unitario: det.precio_unitario,
            },
          });

          // Descontar stock del producto listo
          await tx.productoListo.update({
            where: { id: det.producto_listo_id },
            data: { stock_actual: { decrement: det.cantidad } },
          });
        }
      }
    }
  });

  revalidatePath('/mostrador/pedidos');
}

// ==========================================
// LISTAR PEDIDOS
// ==========================================

export async function listarPedidos() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  return prisma.pedido.findMany({
    where: { usuario_id: userId },
    include: {
      detalles: {
        include: {
          productoListo: true,
          receta: true,
        },
      },
      venta: true,
    },
    orderBy: { fecha: 'desc' },
  });
}

// ==========================================
// ELIMINAR PEDIDO
// ==========================================

export async function eliminarPedido(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  await prisma.pedido.delete({
    where: { id, usuario_id: userId },
  });

  revalidatePath('/mostrador/pedidos');
}

// ==========================================
// CAMBIAR ESTADO DEL PEDIDO
// ==========================================

export async function cambiarEstadoPedido(
  id: number,
  estadoPago: 'NO_PAGADO' | 'PARCIAL' | 'PAGADO_TOTAL',
  estadoPedido: 'PENDIENTE' | 'CANCELADO' | 'ENTREGADO'
) {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');

  // REGLA DE NEGOCIO: No se puede entregar sin pagar
  if (estadoPedido === 'ENTREGADO' && estadoPago !== 'PAGADO_TOTAL') {
    throw new Error('El pedido debe estar pagado para que se entregue');
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id, usuario_id: userId },
    include: { detalles: true, venta: true },
  });

  if (!pedido) throw new Error('Pedido no encontrado');

  // Actualizar estado
  await prisma.pedido.update({
    where: { id },
    data: {
      estado_pago: estadoPago,
      estado_pedido: estadoPedido,
    },
  });

  // Si pasa a "pagado total" + "entregado" y no tiene venta, generarla
  if (
    estadoPago === 'PAGADO_TOTAL' &&
    estadoPedido === 'ENTREGADO' &&
    !pedido.venta
  ) {
    await prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          usuario_id: userId,
          pedido_id: pedido.id,
          cliente: pedido.cliente,
          monto_total: pedido.monto_total,
          origen: 'PEDIDO',
        },
      });

      for (const det of pedido.detalles) {
        if (det.producto_listo_id) {
          await tx.ventaDetalle.create({
            data: {
              venta_id: venta.id,
              producto_listo_id: det.producto_listo_id,
              cantidad: det.cantidad,
              precio_unitario: det.precio_unitario,
            },
          });

          // Descontar stock del producto listo
          await tx.productoListo.update({
            where: { id: det.producto_listo_id },
            data: { stock_actual: { decrement: det.cantidad } },
          });
        }
      }
    });
  }

  revalidatePath('/mostrador/pedidos');
}