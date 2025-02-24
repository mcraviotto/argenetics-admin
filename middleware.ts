import { NextRequest, NextResponse } from "next/server";
import { User } from "./schemas/auth";

const publicRoutes = ["/sign-in", "/sign-up/*"];
const roleRoutes: Record<string, string> = {
  Administrator: "/views/doctors",
  Patient: "/views/studies",
  Doctor: "/views/studies",
  MedicalInstitution: "/views/studies"
};

async function getUser(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/me`, {
      headers: { authorization: token },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener la información del usuario");
    }
    return (await response.json()) as User;
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
    if (route.includes("*")) {
      const regex = new RegExp("^" + route.replace(/\*/g, ".*") + "$");
      return regex.test(pathname);
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
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const user = await getUser(sessionToken);
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (pathname === "/") {
    const redirectRoute = roleRoutes[user.userable_type];
    if (redirectRoute) {
      return NextResponse.redirect(new URL(redirectRoute, request.url));
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
