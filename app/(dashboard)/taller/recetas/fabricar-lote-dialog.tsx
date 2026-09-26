'use client';

import { useState } from 'react';
import { Hammer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fabricarLote } from '@/lib/taller/actions/producciones';

interface MaterialEnReceta {
  cantidad_necesaria: number;
  material: {
    nombre: string;
    unidad_medida: string;
  };
}

interface RecetaFabricable {
  id: number;
  nombre: string;
  materiales: MaterialEnReceta[];
}

interface ProductoDisponible {
  id: number;
  nombre: string;
  stock_actual: number;
}

interface FabricarLoteDialogProps {
  receta: RecetaFabricable;
  productosDisponibles: ProductoDisponible[];
}

export function FabricarLoteDialog({
  receta,
  productosDisponibles,
}: FabricarLoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [productoListoId, setProductoListoId] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);

  function resetear() {
    setProductoListoId('');
    setCantidad(1);
  }

  async function handleFabricar() {
    if (!productoListoId) {
      alert('Elegí a qué producto listo sumar el stock.');
      return;
    }
    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }

    setEnviando(true);
    try {
      await fabricarLote(receta.id, Number(cantidad), Number(productoListoId));
      setOpen(false);
      resetear();
    } catch (error) {
      console.error('Error al fabricar lote:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al fabricar el lote. Intentá de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nuevoEstado) => {
        setOpen(nuevoEstado);
        if (!nuevoEstado) resetear();
      }}
    >
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Hammer className="size-4 text-primary" />
        <span className="sr-only">Fabricar lote</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fabricar Lote</DialogTitle>
          <DialogDescription>
            Vas a fabricar <strong>{receta.nombre}</strong>. Se van a descontar
            los materiales del inventario y se va a sumar stock al producto
            listo que elijas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {productosDisponibles.length === 0 ? (
            <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-4 text-center">
              No tenés productos listos creados. Creá uno en el módulo
              Mostrador antes de fabricar.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`producto-${receta.id}`}>
                  Producto listo a incrementar *
                </Label>
                <Select
                  value={productoListoId}
                  onValueChange={(valor) => setProductoListoId(valor ?? '')}
                >
                  <SelectTrigger id={`producto-${receta.id}`}>
                    <SelectValue placeholder="Elegí un producto listo" />
                  </SelectTrigger>
                  <SelectContent>
                    {productosDisponibles.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre} (stock actual: {p.stock_actual})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`cantidad-${receta.id}`}>
                  Cantidad a fabricar *
                </Label>
                <Input
                  id={`cantidad-${receta.id}`}
                  type="number"
                  min="1"
                  step="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>

              {/* Preview de materiales a descontar */}
              <div className="rounded-lg bg-muted/50 p-4 flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Se van a descontar:
                </span>
                <ul className="text-sm flex flex-col gap-1">
                  {receta.materiales.map((m, i) => {
                    const total = m.cantidad_necesaria * cantidad;
                    return (
                      <li key={i} className="flex justify-between">
                        <span>{m.material.nombre}</span>
                        <span className="font-medium">
                          {total.toFixed(2)}{' '}
                          {m.material.unidad_medida.toLowerCase()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleFabricar}
            disabled={enviando || productosDisponibles.length === 0}
          >
            {enviando ? 'Fabricando...' : 'Confirmar fabricación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}