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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NuevoMaterialDialog } from './nuevo-material-dialog';
import { EditarMaterialDialog } from './editar-material-dialog';
import { EliminarMaterialDialog } from './eliminar-material-dialog';

const unidadLabels: Record<string, string> = {
  UNIDAD: 'Unidad',
  KG: 'Kg',
  LITROS: 'Litros',
  METROS: 'Metros',
};

interface MaterialSerializado {
  id: number;
  nombre: string;
  unidad_medida: string;
  cantidad: number;
  stock_minimo: number;
  costo_unitario: number;
  descripcion: string | null;
}

interface MaterialesTableProps {
  materiales: MaterialSerializado[];
}

export function MaterialesTable({ materiales }: MaterialesTableProps) {
  const [busqueda, setBusqueda] = useState('');
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  const filtrados = materiales.filter((m) => {
    const coincideNombre = m.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const esStockBajo = m.cantidad <= m.stock_minimo;
    return coincideNombre && (!soloStockBajo || esStockBajo);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Botón Nuevo + Filtros */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant={soloStockBajo ? 'default' : 'outline'}
          onClick={() => setSoloStockBajo(!soloStockBajo)}
        >
          Stock bajo
        </Button>
        <NuevoMaterialDialog />
      </div>

      {/* Tabla */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Stock actual</TableHead>
              <TableHead className="text-right">Stock mínimo</TableHead>
              <TableHead className="text-right">Costo unitario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  {materiales.length === 0
                    ? 'No hay materiales cargados todavía.'
                    : 'No se encontraron materiales con esos filtros.'}
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((m) => {
                const esStockBajo = m.cantidad <= m.stock_minimo;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nombre}</TableCell>
                    <TableCell>
                      {unidadLabels[m.unidad_medida] ?? m.unidad_medida}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-2">
                        {esStockBajo && (
                          <Badge variant="destructive">Bajo</Badge>
                        )}
                        {m.cantidad}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {m.stock_minimo}
                    </TableCell>
                    <TableCell className="text-right">
                      ${m.costo_unitario.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditarMaterialDialog material={m} />
                        <EliminarMaterialDialog
                          materialId={m.id}
                          materialNombre={m.nombre}
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