"use client";

import { useState } from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrarVenta } from "@/lib/mostrador/actions/ventas";

interface ProductoDisponible {
  id: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
}

interface ItemCarrito {
  producto_listo_id: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  cantidad: number;
}

interface NuevaVentaDialogProps {
  productos: ProductoDisponible[];
}

export function NuevaVentaDialog({ productos }: NuevaVentaDialogProps) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [cliente, setCliente] = useState("");
  const [seleccionId, setSeleccionId] = useState("");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const disponibles = productos.filter(
    (p) => !carrito.some((item) => item.producto_listo_id === p.id),
  );

  const total = carrito.reduce(
    (acc, item) => acc + item.precio_venta * item.cantidad,
    0,
  );

  function agregarAlCarrito() {
    const producto = productos.find((p) => p.id === Number(seleccionId));
    if (!producto) return;
    setCarrito((prev) => [
      ...prev,
      {
        producto_listo_id: producto.id,
        nombre: producto.nombre,
        precio_venta: producto.precio_venta,
        stock_actual: producto.stock_actual,
        cantidad: 1,
      },
    ]);
    setSeleccionId("");
  }

  function cambiarCantidad(id: number, cantidad: number) {
    setCarrito((prev) =>
      prev.map((item) =>
        item.producto_listo_id === id
          ? {
              ...item,
              cantidad: Math.min(Math.max(cantidad, 1), item.stock_actual),
            }
          : item,
      ),
    );
  }

  function quitarDelCarrito(id: number) {
    setCarrito((prev) => prev.filter((item) => item.producto_listo_id !== id));
  }

  function resetear() {
    setCliente("");
    setSeleccionId("");
    setCarrito([]);
  }

  async function handleCobrar() {
    if (carrito.length === 0) return;
    setEnviando(true);
    try {
      await registrarVenta({
        cliente: cliente || undefined,
        items: carrito.map((item) => ({
          producto_listo_id: item.producto_listo_id,
          cantidad: item.cantidad,
        })),
      });
      resetear();
      setOpen(false);
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      alert(
        error instanceof Error ? error.message : "Error al registrar la venta.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetear();
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button />}>
        <ShoppingCart className="size-4" />
        Nueva Venta
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cobro rápido</DialogTitle>
          <DialogDescription>
            Agregá productos al carrito y registrá el cobro. El stock se
            descuenta automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cliente-venta">Cliente (opcional)</Label>
            <Input
              id="cliente-venta"
              placeholder="Ej: Consumidor final"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="producto-venta">Producto</Label>
              <Select
                value={seleccionId}
                onValueChange={(value) => setSeleccionId(value ?? "")}
              >
                <SelectTrigger id="producto-venta">
                  <SelectValue placeholder="Elegí un producto" />
                </SelectTrigger>
                <SelectContent>
                  {disponibles.length === 0 ? (
                    <SelectItem value="_sin-stock" disabled>
                      No hay más productos con stock
                    </SelectItem>
                  ) : (
                    disponibles.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre} — ${p.precio_venta.toFixed(2)} (
                        {p.stock_actual} disp.)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={agregarAlCarrito}
              disabled={!seleccionId}
            >
              <Plus className="size-4" />
              Agregar
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {carrito.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                El carrito está vacío.
              </p>
            ) : (
              carrito.map((item) => (
                <div
                  key={item.producto_listo_id}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.precio_venta.toFixed(2)} c/u
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={item.stock_actual}
                    value={item.cantidad}
                    onChange={(e) =>
                      cambiarCantidad(
                        item.producto_listo_id,
                        Number(e.target.value),
                      )
                    }
                    className="w-16"
                  />
                  <p className="w-20 text-right text-sm font-medium">
                    ${(item.precio_venta * item.cantidad).toFixed(2)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => quitarDelCarrito(item.producto_listo_id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">${total.toFixed(2)}</span>
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
          <Button
            type="button"
            onClick={handleCobrar}
            disabled={enviando || carrito.length === 0}
          >
            {enviando ? "Cobrando..." : `Cobrar $${total.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
