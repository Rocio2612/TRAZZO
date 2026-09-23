import { crearNegocio } from "@/lib/shared/actions/onboarding";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold">Configurá tu negocio</h1>
        <p className="mb-6 text-gray-600">
          Contanos un poco sobre tu emprendimiento para empezar.
        </p>

        <form action={crearNegocio} className="space-y-4">
          {/* Campo: Nombre del negocio */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium">
              Nombre del negocio *
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              placeholder="Ej: Panadería La Espiga"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Campo: Tipo de negocio */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium">
              Tipo de negocio *
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Seleccioná una opción</option>
              <option value="TALLER">Taller (fabricación)</option>
              <option value="MOSTRADOR">Mostrador (venta)</option>
              <option value="AMBOS">Ambos</option>
            </select>
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Guardar y continuar
          </button>
        </form>
      </div>
    </div>
  );
}
