// app/(dashboard)/page.tsx
export default function DashboardHomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center min-h-[300px]">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        🏠
      </div>
      <h2 className="mt-4 text-xl font-semibold">Inicio</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Panel principal con resumen de tu negocio: pedidos pendientes, stock bajo, ventas del mes y más.
      </p>
      <span className="mt-4 inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
        Próximamente — Sprint 2
      </span>
    </div>
  );
}