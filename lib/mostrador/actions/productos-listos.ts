// Ruta: lib/mostrador/actions/productos-listos.ts

// 'use server' le indica al compilador de Next.js que todas las funciones exportadas
// en este archivo son Server Actions. Se ejecutan exclusivamente en el entorno de NodeJS/servidor,
// permitiendo realizar consultas directas a la base de datos sin exponer credenciales al cliente.
'use server';

// IMPORTACIONES DE DEPENDENCIAS

// auth: Función de Clerk que extrae la sesión activa del usuario desde las cookies HTTP seguras.
import { auth } from '@clerk/nextjs/server';

// prisma: Instancia singleton centralizada de Prisma Client (lib/prisma.ts) para evitar conexiones huérfanas.
import { prisma } from '@/lib/prisma';

// revalidatePath: Función de Next.js que invalida la memoria caché de una ruta específica, forzando al navegador a refrescar los datos sin recargar la página completa.
import { revalidatePath } from 'next/cache';

// z: Biblioteca Zod para construir esquemas de validación tipados en tiempo de ejecución.
import { z } from 'zod';

//1. ESQUEMAS DE VALIDACIÓN CON ZOD (Aduana de seguridad de datos)

// Esquema para la creación de un nuevo Producto Listo de reventa.
// z.coerce permite transformar automáticamente strings de inputs HTML a números de JavaScript.
const crearProductoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre del producto es obligatorio')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  
  precio_venta: z.coerce
    .number()
    .positive('El precio de venta debe ser mayor a 0'),

  stock_actual: z.coerce
    .number()
    .int('El stock debe ser un número entero')
    .nonnegative('El stock actual no puede ser un valor negativo')
    .default(0),

  stock_minimo: z.coerce
    .number()
    .int('El stock mínimo debe ser un número entero')
    .nonnegative('El stock mínimo no puede ser negativo')
    .default(0),
});

// Esquema para la actualización de un producto existente.
// Extiende el esquema base agregando el identificador único obligatorio.
const actualizarProductoSchema = crearProductoSchema.extend({
  id: z.coerce
    .number()
    .int()
    .positive('Identificador de producto inválido'),
});

//2. TIPO DE DATO NORMALIZADO PARA EL FRONTEND

// Define la estructura limpia que recibirá el componente de React de Front 2, con el precio serializado a número y la bandera de alerta calculada.
export type ProductoListoItem = {
  id: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  origen: 'REVENTA' | 'FABRICADO';
  alerta_stock_bajo: boolean;
};

// 3. OBTENER PRODUCTOS LISTOS (LECTURA / LISTADO)
/**
 * Recupera el catálogo completo de productos listos pertenecientes al usuario en sesión.
 * Resuelve la serialización de Decimal a number y evalúa si existe stock bajo.
 */
export async function obtenerProductosListos(): Promise<ProductoListoItem[]> {
  // 3.1. Verificación de identidad con Clerk
  const { userId } = await auth();
  if (!userId) {
    throw new Error('No autorizado: Se requiere sesión activa para consultar productos');
  }

  // 3.2. Consulta a la base de datos filtrada estrictamente por el usuario autenticado
  const productos = await prisma.productoListo.findMany({
    where: {
      usuario_id: userId,
    },
    orderBy: {
      id: 'desc', // Los productos creados más recientemente aparecen primero
    },
  });

  // 3.3. Transformación y serialización de datos
  // Convierte los objetos Decimal de Prisma a números estándar para evitar colisiones en React.
  return productos.map((prod) => ({
    id: prod.id,
    nombre: prod.nombre,
    precio_venta: Number(prod.precio_venta),
    stock_actual: prod.stock_actual,
    stock_minimo: prod.stock_minimo,
    origen: prod.origen as 'REVENTA' | 'FABRICADO',
    alerta_stock_bajo: prod.stock_actual <= prod.stock_minimo,
  }));
}

// 4. CREAR PRODUCTO LISTO / REVENTA (ALTA EN INVENTARIO)
/**
 * Inserta un nuevo producto de reventa en la base de datos Supabase.
 * Es polimórfica: acepta tanto un objeto nativo de FormData (desde <form action={...}>)
 * como un objeto plano de JavaScript (desde un estado local o React Hook Form).
 */
export async function crearProductoListo(
  input: FormData | {
    nombre: string;
    precio_venta: number | string;
    stock_actual?: number | string;
    stock_minimo?: number | string;
  }
) {
  // 4.1. Verificación de identidad con Clerk
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'No autenticado. Por favor, iniciá sesión.' };
  }

  try {
    // 4.2. Extracción de datos según el tipo de entrada recibido
    const datosBrutos =
      input instanceof FormData
        ? {
            nombre: input.get('nombre'),
            precio_venta: input.get('precio_venta'),
            stock_actual: input.get('stock_actual') ?? 0,
            stock_minimo: input.get('stock_minimo') ?? 0,
          }
        : input;

    // 4.3. Validación de campos con Zod
    const datosValidados = crearProductoSchema.parse(datosBrutos);

    // 4.4. Persistencia en la tabla 'productos_listos' vía Prisma
    const nuevoProducto = await prisma.productoListo.create({
      data: {
        usuario_id: userId,
        nombre: datosValidados.nombre,
        precio_venta: datosValidados.precio_venta,
        stock_actual: datosValidados.stock_actual,
        stock_minimo: datosValidados.stock_minimo,
        origen: 'REVENTA', // Todo producto cargado directamente desde este módulo es de reventa
      },
    });

    // 4.5. Invalidación de caché para que las tablas del dashboard se actualicen al instante
    revalidatePath('/mostrador/productos');
    revalidatePath('/');

    return {
      success: true,
      data: {
        id: nuevoProducto.id,
        nombre: nuevoProducto.nombre,
        precio_venta: Number(nuevoProducto.precio_venta),
        stock_actual: nuevoProducto.stock_actual,
        stock_minimo: nuevoProducto.stock_minimo,
      },
    };
  } catch (error) {
    // Captura de errores de validación de Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Error en los datos ingresados',
      };
    }

    // Captura de errores de base de datos u otras excepciones
    console.error('Error al crear producto listo:', error);
    return {
      success: false,
      error: 'Ocurrió un error inesperado al guardar el producto.',
    };
  }
}

// 5. ACTUALIZAR PRODUCTO LISTO (MODIFICACIÓN)
/**
 * Modifica el nombre, precio o parámetros de stock de un producto comercial existente.
 * Valida que el producto pertenezca al usuario que intenta realizar la operación.
 */
export async function actualizarProductoListo(
  input: FormData | {
    id: number | string;
    nombre: string;
    precio_venta: number | string;
    stock_actual: number | string;
    stock_minimo: number | string;
  }
) {
  // 5.1. Verificación de identidad
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // 5.2. Extracción de valores
    const datosBrutos =
      input instanceof FormData
        ? {
            id: input.get('id'),
            nombre: input.get('nombre'),
            precio_venta: input.get('precio_venta'),
            stock_actual: input.get('stock_actual'),
            stock_minimo: input.get('stock_minimo'),
          }
        : input;

    // 5.3. Validación de tipos con Zod
    const datosValidados = actualizarProductoSchema.parse(datosBrutos);

    // 5.4. Verificación de propiedad (evita que un usuario altere productos de otro negocio)
    const productoExistente = await prisma.productoListo.findFirst({
      where: {
        id: datosValidados.id,
        usuario_id: userId,
      },
    });

    if (!productoExistente) {
      return { success: false, error: 'El producto no existe o no tenés permiso para modificarlo' };
    }

    // 5.5. Aplicación de cambios en Supabase
    await prisma.productoListo.update({
      where: { id: datosValidados.id },
      data: {
        nombre: datosValidados.nombre,
        precio_venta: datosValidados.precio_venta,
        stock_actual: datosValidados.stock_actual,
        stock_minimo: datosValidados.stock_minimo,
      },
    });

    // 5.6. Refresco de rutas
    revalidatePath('/mostrador/productos');
    revalidatePath('/');

    return { success: true, message: 'Producto actualizado con éxito' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Error en los datos ingresados',};
    }
    console.error('Error al actualizar producto:', error);
    return { success: false, error: 'No se pudo actualizar el producto' };
  }
}

// 6. ELIMINAR PRODUCTO LISTO (BAJA CON RESTRICCIÓN DE INTEGRIDAD)
/**
 * Elimina un producto del catálogo siempre y cuando no comprometa la integridad histórica
 * (por ejemplo, si ya tiene ventas asentadas o pedidos en curso).
 */
export async function eliminarProductoListo(productoId: number) {
  // 6.1. Verificación de identidad
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // 6.2. Comprobar existencia y titularidad
    const producto = await prisma.productoListo.findFirst({
      where: {
        id: productoId,
        usuario_id: userId,
      },
      include: {
        ventaDetalles: { select: { id: true }, take: 1 },
        pedidoDetalles: { select: { id: true }, take: 1 },
      },
    });

    if (!producto) {
      return { success: false, error: 'El producto no existe o no tenés permiso para eliminarlo' };
    }

    // 6.3. Regla de negocio / Integridad relacional:
    // No se puede borrar físicamente un producto si ya tiene tickets de venta o pedidos asociados,
    // ya que rompería el historial contable del emprendimiento.
    if (producto.ventaDetalles.length > 0 || producto.pedidoDetalles.length > 0) {
      return {
        success: false,
        error: 'No se puede eliminar el producto porque ya forma parte de ventas o pedidos registrados.',
      };
    }

    // 6.4. Eliminación en base de datos
    await prisma.productoListo.delete({
      where: { id: productoId },
    });

    // 6.5. Refresco de interfaz
    revalidatePath('/mostrador/productos');
    revalidatePath('/');

    return { success: true, message: 'Producto eliminado correctamente' };
  } catch (error) {
    console.error('Error al eliminar producto listo:', error);
    return { success: false, error: 'Ocurrió un fallo al intentar eliminar el producto' };
  }
}