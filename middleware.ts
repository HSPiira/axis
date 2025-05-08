export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // Match specific routes that need protection
    "/dashboard/:path*",
    "/clients/:path*",
    "/settings/:path*",
    "/profile/:path*",
    // Exclude auth-related routes
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
