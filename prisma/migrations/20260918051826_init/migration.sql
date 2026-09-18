-- CreateEnum
CREATE TYPE "TipoNegocio" AS ENUM ('TALLER', 'MOSTRADOR', 'AMBOS');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('UNIDAD', 'KG', 'LITROS', 'METROS');

-- CreateEnum
CREATE TYPE "OrigenProducto" AS ENUM ('FABRICADO', 'REVENTA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('NO_PAGADO', 'PARCIAL', 'PAGADO_TOTAL');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'CANCELADO', 'ENTREGADO');

-- CreateEnum
CREATE TYPE "OrigenVenta" AS ENUM ('DIRECTA', 'PEDIDO');

-- CreateEnum
CREATE TYPE "TipoGasto" AS ENUM ('VARIABLE', 'EXTRA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negocios" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoNegocio" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negocios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiales" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad_medida" "UnidadMedida" NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "costo_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descripcion" TEXT,

    CONSTRAINT "materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta_materiales" (
    "id" SERIAL NOT NULL,
    "receta_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "cantidad_necesaria" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "receta_materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "receta_id" INTEGER NOT NULL,
    "producto_listo_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_listos" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "stock_actual" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "origen" "OrigenProducto" NOT NULL,
    "receta_id" INTEGER,

    CONSTRAINT "productos_listos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "cliente" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'NO_PAGADO',
    "estado_pedido" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "descripcion" TEXT,
    "monto_total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_detalles" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "producto_listo_id" INTEGER,
    "receta_id" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "pedido_id" INTEGER,
    "cliente" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_total" DECIMAL(10,2) NOT NULL,
    "origen" "OrigenVenta" NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_detalles" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "producto_listo_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "venta_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoGasto" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "material_id" INTEGER,
    "producto_listo_id" INTEGER,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "negocios_usuario_id_key" ON "negocios"("usuario_id");

-- CreateIndex
CREATE INDEX "materiales_usuario_id_idx" ON "materiales"("usuario_id");

-- CreateIndex
CREATE INDEX "recetas_usuario_id_idx" ON "recetas"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "receta_materiales_receta_id_material_id_key" ON "receta_materiales"("receta_id", "material_id");

-- CreateIndex
CREATE INDEX "producciones_usuario_id_idx" ON "producciones"("usuario_id");

-- CreateIndex
CREATE INDEX "productos_listos_usuario_id_idx" ON "productos_listos"("usuario_id");

-- CreateIndex
CREATE INDEX "pedidos_usuario_id_idx" ON "pedidos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_usuario_id_numero_key" ON "pedidos"("usuario_id", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_pedido_id_key" ON "ventas"("pedido_id");

-- CreateIndex
CREATE INDEX "ventas_usuario_id_idx" ON "ventas"("usuario_id");

-- CreateIndex
CREATE INDEX "gastos_usuario_id_idx" ON "gastos"("usuario_id");

-- AddForeignKey
ALTER TABLE "negocios" ADD CONSTRAINT "negocios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recetas" ADD CONSTRAINT "recetas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_materiales" ADD CONSTRAINT "receta_materiales_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta_materiales" ADD CONSTRAINT "receta_materiales_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producciones" ADD CONSTRAINT "producciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producciones" ADD CONSTRAINT "producciones_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producciones" ADD CONSTRAINT "producciones_producto_listo_id_fkey" FOREIGN KEY ("producto_listo_id") REFERENCES "productos_listos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_listos" ADD CONSTRAINT "productos_listos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_listos" ADD CONSTRAINT "productos_listos_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_detalles" ADD CONSTRAINT "pedido_detalles_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_detalles" ADD CONSTRAINT "pedido_detalles_producto_listo_id_fkey" FOREIGN KEY ("producto_listo_id") REFERENCES "productos_listos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_detalles" ADD CONSTRAINT "pedido_detalles_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalles" ADD CONSTRAINT "venta_detalles_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalles" ADD CONSTRAINT "venta_detalles_producto_listo_id_fkey" FOREIGN KEY ("producto_listo_id") REFERENCES "productos_listos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_producto_listo_id_fkey" FOREIGN KEY ("producto_listo_id") REFERENCES "productos_listos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
