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
import { NuevaRecetaDialog } from './nueva-receta-dialog';
import { EditarRecetaDialog } from './editar-receta-dialog';
import { EliminarRecetaDialog } from './eliminar-receta-dialog';

interface MaterialEnReceta {
  id: number;
  material_id: number;
  cantidad_necesaria: number;
  material: {
    id: number;
    nombre: string;
    unidad_medida: string;
    costo_unitario: number;
  };
}

interface RecetaSerializada {
  id: number;
  nombre: string;
  descripcion: string | null;
  materiales: MaterialEnReceta[];
  cantidadProductosListos: number;
  cantidadPedidos: number;
}

interface MaterialDisponible {
  id: number;
  nombre: string;
  unidad_medida: string;
  costo_unitario: number;
}

interface RecetasTableProps {
  recetas: RecetaSerializada[];
  materialesDisponibles: MaterialDisponible[];
}

function calcularCostoReceta(materiales: MaterialEnReceta[]): number {
  return materiales.reduce(
    (total, rm) => total + rm.cantidad_necesaria * rm.material.costo_unitario,
    0
  );
}

export function RecetasTable({
  recetas,
  materialesDisponibles,
}: RecetasTableProps) {
  const [busqueda, setBusqueda] = useState('');

  const filtradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Buscador + Botón nueva */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receta por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-8"
          />
        </div>
        <NuevaRecetaDialog materialesDisponibles={materialesDisponibles} />
      </div>

      {/* Tabla */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Materiales</TableHead>
              <TableHead className="text-right">Costo por unidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {recetas.length === 0
                    ? 'No hay recetas cargadas todavía.'
                    : 'No se encontraron recetas con esa búsqueda.'}
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((r) => {
                const costo = calcularCostoReceta(r.materiales);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nombre}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {r.descripcion || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.materiales.length}{' '}
                      {r.materiales.length === 1 ? 'material' : 'materiales'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${costo.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditarRecetaDialog
                          receta={r}
                          materialesDisponibles={materialesDisponibles}
                        />
                        <EliminarRecetaDialog
                          recetaId={r.id}
                          recetaNombre={r.nombre}
                        />
                      </div>
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