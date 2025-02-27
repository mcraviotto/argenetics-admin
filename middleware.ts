import { NextRequest, NextResponse } from "next/server";
import { User } from "./schemas/auth";

const publicRoutes = ["/sign-in", "/sign-up/*"];

const roleRedirects: Record<string, string> = {
  Administrator: "/views/studies",
  Patient: "/views/studies",
  Doctor: "/views/studies",
  MedicalInstitution: "/views/studies",
};

const allowedRoutes: Record<string, string[]> = {
  Administrator: ["/views/*"],
  Doctor: ["/views/studies/*", "/views/patients/*"],
  Patient: ["/views/studies/*"],
  MedicalInstitution: ["/views/studies/*", "/views/doctors/*", "/views/patients/*"],
};

function matchPattern(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -1);
    return pathname === base.slice(0, -1) || pathname.startsWith(base);
  }
  return pathname === pattern;
}

async function getUser(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/me`, {
      headers: { authorization: token },
    });
    if (!response.ok) throw new Error("No se pudo obtener la información del usuario");

    const user = (await response.json()) as User;
    return user;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return null;
  }
}

function isPublicRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route.endsWith("/*")) {
      const baseRoute = route.slice(0, -2);
      return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
    }
    return pathname === route;
  });
}
export default async function authMiddleware(request: NextRequest) {
  const sessionToken = request.cookies.get("sessionToken")?.value;
  const pathname = request.nextUrl.pathname;

  if (isPublicRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  if (!sessionToken) {
    console.log("No session token");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const user = await getUser(sessionToken);
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!user.confirmed && pathname !== "/otp") {
    return NextResponse.redirect(new URL("/otp", request.url));
  }
  if (user.confirmed && pathname === "/otp") {
    const redirectRoute = roleRedirects[user.userable_type] || "/";
    return NextResponse.redirect(new URL(redirectRoute, request.url));
  }

  if (user.confirmed && user.state !== "active" && pathname !== "/waiting") {
    return NextResponse.redirect(new URL("/waiting", request.url));
  }

  if (user.state === "active" && pathname === "/waiting") {
    const redirectRoute = roleRedirects[user.userable_type] || "/";
    return NextResponse.redirect(new URL(redirectRoute, request.url));
  }

  if (pathname === "/") {
    const redirectRoute = roleRedirects[user.userable_type] || "/sign-in";
    return NextResponse.redirect(new URL(redirectRoute, request.url));
  }

  if (pathname.startsWith("/views")) {
    const allowed = allowedRoutes[user.userable_type] || [];
    const isAllowed = allowed.some((pattern) => matchPattern(pathname, pattern));
    if (!isAllowed) {
      const redirectRoute = roleRedirects[user.userable_type] || "/sign-in";
      return NextResponse.redirect(new URL(redirectRoute, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
