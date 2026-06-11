export const authRoutes = {
  signIn: "/auth/sign-in",
} as const;

export const publicRoutes = ["/", "/blogs"] as const;

export const protectedRoutePrefixes = ["/blogs/create", "/blogs/edit"] as const;

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePrefixes.some((route) => pathname.startsWith(route));
}
