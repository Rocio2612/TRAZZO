'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { crearReceta } from '@/lib/taller/actions/recetas';

const unidadLabels: Record<string, string> = {
  UNIDAD: 'Unidad',
  KG: 'Kg',
  LITROS: 'Litros',
  METROS: 'Metros',
};

interface MaterialDisponible {
  id: number;
  nombre: string;
  unidad_medida: string;
  costo_unitario: number;
}

interface MaterialSeleccionado {
  material_id: number;
  cantidad_necesaria: number;
}

interface NuevaRecetaDialogProps {
  materialesDisponibles: MaterialDisponible[];
}

export function NuevaRecetaDialog({
  materialesDisponibles,
}: NuevaRecetaDialogProps) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [materiales, setMateriales] = useState<MaterialSeleccionado[]>([]);

  const costoTotal = materiales.reduce((total, m) => {
    const material = materialesDisponibles.find((md) => md.id === m.material_id);
    if (!material) return total;
    return total + m.cantidad_necesaria * material.costo_unitario;
  }, 0);

  function agregarMaterial() {
    setMateriales([
      ...materiales,
      { material_id: 0, cantidad_necesaria: 1 },
    ]);
  }

  function quitarMaterial(index: number) {
    setMateriales(materiales.filter((_, i) => i !== index));
  }

  function actualizarMaterial(
    index: number,
    campo: keyof MaterialSeleccionado,
    valor: number
  ) {
    const copia = [...materiales];
    copia[index] = { ...copia[index], [campo]: valor };
    setMateriales(copia);
  }

  function resetear() {
    setMateriales([]);
  }

  async function handleSubmit(formData: FormData) {
    // Validar que haya al menos un material seleccionado
    const materialesValidos = materiales.filter(
      (m) => m.material_id > 0 && m.cantidad_necesaria > 0
    );

    if (materialesValidos.length === 0) {
      alert('Agregá al menos un material con su cantidad.');
      return;
    }

    formData.set('materiales', JSON.stringify(materialesValidos));

    setEnviando(true);
    try {
      await crearReceta(formData);
      setOpen(false);
      resetear();
    } catch (error) {
      console.error('Error al crear receta:', error);
      alert('Error al crear la receta. Revisá los datos.');
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
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Nueva Receta
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Receta</DialogTitle>
          <DialogDescription>
            Creá una receta indicando los materiales que se necesitan para
            fabricar 1 unidad del producto.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Budín de limón"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Ej: Receta para budín individual de 400g"
              rows={2}
            />
          </div>

          {/* Selector de materiales */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Materiales *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarMaterial}
              >
                <Plus className="size-4" />
                Agregar material
              </Button>
            </div>

            {materiales.length === 0 ? (
              <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-4 text-center">
                Todavía no agregaste materiales. Hacé clic en &quot;Agregar
                material&quot;.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {materiales.map((m, index) => {
                  const materialSeleccionado = materialesDisponibles.find(
                    (mat) => String(mat.id) === String(m.material_id)
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-end gap-3 border rounded-lg p-3 bg-muted/20"
                    >
                      {/* 1. Selector de Material (toma todo el espacio disponible) */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <Label className="text-xs">Material</Label>
                        <Select
                          value={m.material_id ? String(m.material_id) : ''}
                          onValueChange={(valor) =>
                            actualizarMaterial(
                              index,
                              'material_id',
                              Number(valor)
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elegí un material">
                              {materialSeleccionado
                                ? `${materialSeleccionado.nombre} (${unidadLabels[materialSeleccionado.unidad_medida]})`
                                : undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="min-w-[320px]">
                            {materialesDisponibles.map((md) => (
                              <SelectItem key={md.id} value={String(md.id)}>
                                {md.nombre} ({unidadLabels[md.unidad_medida]}) — ${md.costo_unitario.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 2. Campo Cantidad compacto con unidad flotante */}
                      <div className="w-32 shrink-0 flex flex-col gap-1">
                        <Label className="text-xs">Cantidad</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={m.cantidad_necesaria}
                            onChange={(e) =>
                              actualizarMaterial(
                                index,
                                'cantidad_necesaria',
                                Number(e.target.value)
                              )
                            }
                            className="pr-10"
                          />
                          {materialSeleccionado && (
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                              {unidadLabels[materialSeleccionado.unidad_medida]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3. Botón Quitar */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => quitarMaterial(index)}
                        className="size-9 shrink-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Costo calculado */}
          <div className="rounded-lg bg-muted/50 p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Costo por unidad
            </span>
            <span className="text-lg font-semibold">${costoTotal.toFixed(2)}</span>
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
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Guardando...' : 'Guardar receta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}