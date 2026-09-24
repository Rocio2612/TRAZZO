"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearProductoListo } from "@/lib/mostrador/actions/productos-listos";

export function NuevoProductoDialog() {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setEnviando(true);
    try {
      await crearProductoListo(formData);
      setOpen(false);
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al crear el producto. Revisá los datos.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Nuevo Producto
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Producto</DialogTitle>
          <DialogDescription>
            Cargá un producto de reventa listo para vender. Todos los campos son
            obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          {/* Los productos cargados desde el mostrador son de reventa */}
          <input type="hidden" name="origen" value="REVENTA" />

          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Gaseosa 1.5L"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="precio_venta">Precio de venta *</Label>
            <Input
              id="precio_venta"
              name="precio_venta"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ej: 2500.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="stock_actual">Stock actual *</Label>
              <Input
                id="stock_actual"
                name="stock_actual"
                type="number"
                step="1"
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
                step="1"
                min="0"
                defaultValue="0"
                required
              />
            </div>
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
              {enviando ? "Guardando..." : "Guardar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
