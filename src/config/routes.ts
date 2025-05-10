export const publicRoutes = ["/", "/login", "/register", "/forgot-password"];
export const authRoutes = ["/login", "/register", "/forgot-password"];
export const apiAuthPrefix = "/api/auth";
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

// All routes that require authentication
export const protectedRoutes = [
  "/dashboard",
  "/clients",
  "/settings",
  "/profile",
  // Add any other protected routes here
];
