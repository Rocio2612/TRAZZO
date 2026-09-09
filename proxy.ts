import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Definir qué rutas están protegidas (requieren autenticación)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/materiales(.*)',
  '/productos(.*)',
  '/pedidos(.*)',
  '/ventas(.*)',
  '/gastos(.*)',
  '/reporte(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Si la ruta está protegida, verificar autenticación
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Excluir archivos estáticos y carpetas internas de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para rutas de API
    '/(api|trpc)(.*)',
  ],
};