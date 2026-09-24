// app/(dashboard)/productos/productos-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Producto {
  id: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
}

interface ProductosTableProps {
  productos: Producto[];
}

export function ProductosTable({ productos }: ProductosTableProps) {
  if (!productos || productos.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          📦
        </div>
        <h3 className="mt-4 text-base font-semibold">No hay productos cargados</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
          Aún no registraste productos de reventa. Utilizá el botón superior para dar de alta el primero.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio Venta</TableHead>
            <TableHead className="text-center">Stock Actual</TableHead>
            <TableHead className="text-center">Stock Mínimo</TableHead>
            <TableHead className="text-center">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((prod) => {
            const stockBajo = prod.stock_actual <= prod.stock_minimo;
            return (
              <TableRow key={prod.id}>
                <TableCell className="font-medium">{prod.nombre}</TableCell>
                <TableCell className="text-right font-semibold">
                  ${prod.precio_venta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center">{prod.stock_actual}</TableCell>
                <TableCell className="text-center text-muted-foreground">{prod.stock_minimo}</TableCell>
                <TableCell className="text-center">
                  {stockBajo ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-300">
                      Stock bajo
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
                      En stock
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}