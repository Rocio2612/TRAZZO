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

interface VentaSerializada {
  id: number;
  cliente: string | null;
  fecha: string;
  monto_total: number;
  cantidadItems: number;
}

interface VentasTableProps {
  ventas: VentaSerializada[];
}

export function VentasTable({ ventas }: VentasTableProps) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = ventas.filter((v) =>
    (v.cliente ?? "consumidor final")
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
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
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Ítems</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  {ventas.length === 0
                    ? "Todavía no se registraron ventas."
                    : "No se encontraron ventas con ese cliente."}
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {v.cliente ?? "Consumidor final"}
                  </TableCell>
                  <TableCell>
                    {new Date(v.fecha).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {v.cantidadItems}
                  </TableCell>
                  <TableCell className="text-right">
                    ${v.monto_total.toFixed(2)}
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
