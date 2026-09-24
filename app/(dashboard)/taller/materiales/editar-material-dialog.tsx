'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

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
import { editarMaterial } from '@/lib/taller/actions/materiales';

interface MaterialEditable {
  id: number;
  nombre: string;
  unidad_medida: string;
  cantidad: number;
  stock_minimo: number;
  costo_unitario: number;
  descripcion: string | null;
}

interface EditarMaterialDialogProps {
  material: MaterialEditable;
}

export function EditarMaterialDialog({ material }: EditarMaterialDialogProps) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setEnviando(true);
    try {
      await editarMaterial(material.id, formData);
      setOpen(false);
    } catch (error) {
      console.error('Error al editar material:', error);
      alert('Error al editar el material. Revisá los datos.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Pencil className="size-4" />
        <span className="sr-only">Editar</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
          <DialogDescription>
            Modificá los datos del material. Los cambios se guardan al instante.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`nombre-${material.id}`}>Nombre *</Label>
            <Input
              id={`nombre-${material.id}`}
              name="nombre"
              defaultValue={material.nombre}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`unidad-${material.id}`}>Unidad de medida *</Label>
            <Select
              name="unidad_medida"
              defaultValue={material.unidad_medida}
              required
            >
              <SelectTrigger id={`unidad-${material.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNIDAD">Unidad</SelectItem>
                <SelectItem value="KG">Kilogramos (kg)</SelectItem>
                <SelectItem value="LITROS">Litros</SelectItem>
                <SelectItem value="METROS">Metros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`cantidad-${material.id}`}>Cantidad actual *</Label>
              <Input
                id={`cantidad-${material.id}`}
                name="cantidad"
                type="number"
                step="0.01"
                min="0"
                defaultValue={material.cantidad}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`stock-min-${material.id}`}>Stock mínimo *</Label>
              <Input
                id={`stock-min-${material.id}`}
                name="stock_minimo"
                type="number"
                step="0.01"
                min="0"
                defaultValue={material.stock_minimo}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`costo-${material.id}`}>Costo unitario *</Label>
            <Input
              id={`costo-${material.id}`}
              name="costo_unitario"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={material.costo_unitario}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`desc-${material.id}`}>Descripción (opcional)</Label>
            <Textarea
              id={`desc-${material.id}`}
              name="descripcion"
              defaultValue={material.descripcion ?? ''}
              rows={3}
            />
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