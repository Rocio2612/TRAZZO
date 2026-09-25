'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

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
import { editarReceta } from '@/lib/taller/actions/recetas';

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

interface MaterialEnReceta {
  material_id: number;
  cantidad_necesaria: number;
}

interface RecetaEditable {
  id: number;
  nombre: string;
  descripcion: string | null;
  materiales: {
    material_id: number;
    cantidad_necesaria: number;
    material: {
      id: number;
      nombre: string;
      unidad_medida: string;
      costo_unitario: number;
    };
  }[];
}

interface EditarRecetaDialogProps {
  receta: RecetaEditable;
  materialesDisponibles: MaterialDisponible[];
}

export function EditarRecetaDialog({
  receta,
  materialesDisponibles,
}: EditarRecetaDialogProps) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const materialesIniciales: MaterialEnReceta[] = receta.materiales.map((m) => ({
    material_id: m.material_id,
    cantidad_necesaria: m.cantidad_necesaria,
  }));

  const [materiales, setMateriales] =
    useState<MaterialEnReceta[]>(materialesIniciales);

  const costoTotal = materiales.reduce((total, m) => {
    const material = materialesDisponibles.find((md) => md.id === m.material_id);
    if (!material) return total;
    return total + m.cantidad_necesaria * material.costo_unitario;
  }, 0);

  function agregarMaterial() {
    setMateriales([...materiales, { material_id: 0, cantidad_necesaria: 1 }]);
  }

  function quitarMaterial(index: number) {
    setMateriales(materiales.filter((_, i) => i !== index));
  }

  function actualizarMaterial(
    index: number,
    campo: keyof MaterialEnReceta,
    valor: number
  ) {
    const copia = [...materiales];
    copia[index] = { ...copia[index], [campo]: valor };
    setMateriales(copia);
  }

  function resetear() {
    setMateriales(materialesIniciales);
  }

  async function handleSubmit(formData: FormData) {
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
      await editarReceta(receta.id, formData);
      setOpen(false);
    } catch (error) {
      console.error('Error al editar receta:', error);
      alert('Error al editar la receta. Revisá los datos.');
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
        <Pencil className="size-4" />
        <span className="sr-only">Editar</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Receta</DialogTitle>
          <DialogDescription>
            Modificá los datos de la receta y sus materiales.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`nombre-${receta.id}`}>Nombre *</Label>
            <Input
              id={`nombre-${receta.id}`}
              name="nombre"
              defaultValue={receta.nombre}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`desc-${receta.id}`}>Descripción (opcional)</Label>
            <Textarea
              id={`desc-${receta.id}`}
              name="descripcion"
              defaultValue={receta.descripcion ?? ''}
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
                No hay materiales. Hacé clic en &quot;Agregar material&quot;.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {materiales.map((m, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-2 border rounded-lg p-3"
                  >
                    <div className="flex-1 flex flex-col gap-1">
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
                        <SelectTrigger>
                          <SelectValue placeholder="Elegí un material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialesDisponibles.map((md) => (
                            <SelectItem key={md.id} value={String(md.id)}>
                              {md.nombre} ({unidadLabels[md.unidad_medida]}) —
                              ${md.costo_unitario.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-32 flex flex-col gap-1">
                      <Label className="text-xs">Cantidad</Label>
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
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => quitarMaterial(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Costo calculado */}
          <div className="rounded-lg bg-muted/50 p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Costo por unidad
            </span>
            <span className="text-lg font-semibold">
              ${costoTotal.toFixed(2)}
            </span>
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
              {enviando ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}