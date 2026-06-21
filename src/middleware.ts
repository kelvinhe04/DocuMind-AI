import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rutas de la app que requieren sesión iniciada.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/chat(.*)",
  "/documents(.*)",
  "/upload(.*)",
  "/search(.*)",
  "/billing(.*)",
  "/pricing(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    // Todo excepto archivos estáticos y _next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|map)).*)",
    // Siempre ejecutar en rutas API
    "/(api|trpc)(.*)",
  ],
};
