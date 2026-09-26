'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface MaterialEnReceta {
  cantidad_necesaria: number;
  material: {
    nombre: string;
    costo_unitario: number;
  };
}

interface ProduccionSerializada {
  id: number;
  cantidad: number;
  fecha: string;
  receta: {
    id: number;
    nombre: string;
    materiales: MaterialEnReceta[];
  };
  productoListo: {
    id: number;
    nombre: string;
  };
}

interface ProduccionTableProps {
  producciones: ProduccionSerializada[];
}

function calcularCostoTanda(produccion: ProduccionSerializada): number {
  const costoUnitario = produccion.receta.materiales.reduce(
    (total, rm) => total + rm.cantidad_necesaria * rm.material.costo_unitario,
    0
  );
  return costoUnitario * produccion.cantidad;
}

function formatearFecha(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProduccionTable({ producciones }: ProduccionTableProps) {
  const [busqueda, setBusqueda] = useState('');

  const filtradas = producciones.filter((p) =>
    p.receta.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Buscador */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por receta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Receta</TableHead>
              <TableHead>Producto listo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Costo de la tanda</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {producciones.length === 0
                    ? 'No hay producciones registradas todavía.'
                    : 'No se encontraron producciones con esa búsqueda.'}
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((p) => {
                const costo = calcularCostoTanda(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">
                      {formatearFecha(p.fecha)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.receta.nombre}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.productoListo.nombre}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {p.cantidad}
                    </TableCell>
                    <TableCell className="text-right">
                      ${costo.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}