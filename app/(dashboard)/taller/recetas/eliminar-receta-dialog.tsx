'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { eliminarReceta } from '@/lib/taller/actions/recetas';

interface EliminarRecetaDialogProps {
  recetaId: number;
  recetaNombre: string;
}

export function EliminarRecetaDialog({
  recetaId,
  recetaNombre,
}: EliminarRecetaDialogProps) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleEliminar() {
    setEnviando(true);
    try {
      await eliminarReceta(recetaId);
      setOpen(false);
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al eliminar la receta.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Trash2 className="size-4 text-destructive" />
        <span className="sr-only">Eliminar</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a eliminar <strong>{recetaNombre}</strong>. Esta acción no se
            puede deshacer.
            <br />
            <br />
            Si la receta está asociada a un producto listo o a un pedido
            pendiente, no se va a poder eliminar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={enviando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleEliminar();
            }}
            disabled={enviando}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {enviando ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}