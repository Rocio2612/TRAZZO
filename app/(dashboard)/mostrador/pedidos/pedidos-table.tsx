"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const estadoPagoLabels: Record<string, string> = {
  NO_PAGADO: "No pagado",
  PARCIAL: "Seña",
  PAGADO_TOTAL: "Pagado",
};

const estadoPagoVariants: Record<
  string,
  "destructive" | "secondary" | "default"
> = {
  NO_PAGADO: "destructive",
  PARCIAL: "secondary",
  PAGADO_TOTAL: "default",
};

const estadoPedidoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CANCELADO: "Cancelado",
  ENTREGADO: "Entregado",
};

interface PedidoSerializado {
  id: number;
  numero: number;
  cliente: string;
  fecha: string;
  estado_pago: string;
  estado_pedido: string;
  monto_total: number;
  monto_senia: number;
}

interface PedidosTableProps {
  pedidos: PedidoSerializado[];
}

export function PedidosTable({ pedidos }: PedidosTableProps) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Seña</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  {pedidos.length === 0
                    ? "Todavía no hay encargos cargados."
                    : "No se encontraron pedidos con ese cliente."}
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">#{p.numero}</TableCell>
                  <TableCell>{p.cliente}</TableCell>
                  <TableCell>
                    {new Date(p.fecha).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={estadoPagoVariants[p.estado_pago] ?? "default"}
                    >
                      {estadoPagoLabels[p.estado_pago] ?? p.estado_pago}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {estadoPedidoLabels[p.estado_pedido] ?? p.estado_pedido}
                  </TableCell>
                  <TableCell className="text-right">
                    ${p.monto_senia.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${p.monto_total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
