'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

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
import { crearMaterial } from '@/lib/taller/actions/materiales';

export function NuevoMaterialDialog() {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setEnviando(true);
    try {
      await crearMaterial(formData);
      setOpen(false);
    } catch (error) {
      console.error('Error al crear material:', error);
      alert('Error al crear el material. Revisá los datos.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Nuevo Material
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Material</DialogTitle>
          <DialogDescription>
            Cargá un insumo o materia prima. Todos los campos son obligatorios
            excepto la descripción.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Harina 000"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="unidad_medida">Unidad de medida *</Label>
            <Select name="unidad_medida" required>
              <SelectTrigger id="unidad_medida">
                <SelectValue placeholder="Seleccioná una unidad" />
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
              <Label htmlFor="cantidad">Cantidad actual *</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stock_minimo">Stock mínimo *</Label>
              <Input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="costo_unitario">Costo unitario *</Label>
            <Input
              id="costo_unitario"
              name="costo_unitario"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ej: 1500.00"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Ej: Marca, proveedor, observaciones..."
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
              {enviando ? 'Guardando...' : 'Guardar material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}