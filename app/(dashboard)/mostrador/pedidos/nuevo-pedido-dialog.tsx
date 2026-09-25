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
import { Textarea } from "@/components/ui/textarea";
import { crearPedido } from "@/lib/mostrador/actions/pedidos";

const hoyISO = () => new Date().toISOString().slice(0, 10);

export function NuevoPedidoDialog() {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setEnviando(true);
    try {
      await crearPedido(formData);
      setOpen(false);
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al crear el pedido. Revisá los datos.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Nuevo Pedido
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Pedido</DialogTitle>
          <DialogDescription>
            Cargá un encargo con la fecha, el cliente y la seña que dejó. El
            número de pedido se asigna solo.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cliente-pedido">Cliente *</Label>
            <Input
              id="cliente-pedido"
              name="cliente"
              placeholder="Ej: María Gómez"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fecha-pedido">Fecha *</Label>
            <Input
              id="fecha-pedido"
              name="fecha"
              type="date"
              defaultValue={hoyISO()}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="monto-total-pedido">Monto total *</Label>
              <Input
                id="monto-total-pedido"
                name="monto_total"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ej: 15000.00"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="monto-senia-pedido">Seña inicial</Label>
              <Input
                id="monto-senia-pedido"
                name="monto_senia"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="descripcion-pedido">Descripción (opcional)</Label>
            <Textarea
              id="descripcion-pedido"
              name="descripcion"
              placeholder="Ej: detalle del encargo, color, talle..."
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
              {enviando ? "Guardando..." : "Guardar pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
