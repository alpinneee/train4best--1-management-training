import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const role = token.role as string
  const path = request.nextUrl.pathname

  // Rute yang dilindungi berdasarkan role
  if (path.startsWith("/dashboard") && role !== "super_admin") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (path.startsWith("/instructure") && role !== "instructor") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (path.startsWith("/participant") && role !== "participant") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/instructure/:path*", "/participant/:path*"]
} 