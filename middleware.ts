import { NextResponse, type NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/penjual"]
// Define public routes that should not be accessible when logged in
const authRoutes = ["/login", "/register", "/forgot-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is authenticated by looking for the session cookie
  // Replace 'session' with your actual session cookie name
  const isAuthenticated = request.cookies.has("SNAPEATS_SESSION")
  // IMPORTANT: Check if the current URL is already the one we want to redirect to
  // to prevent redirect loops

  // Case 1: User is authenticated but trying to access auth pages (login, register)
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    const cookie = request.cookies.get("SNAPEATS_SESSION")?.value;
    console.log(cookie)
    // const kukis = request.cookies.get("SNAPEATS_SESSION")?? "";
    // const decrypted = decryptAESClient(kukis)
    // Redirect to dashboard or home page
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Case 2: User is not authenticated and trying to access protected routes
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) 
    {
    console.log(pathname);
    if(pathname.startsWith('/penjual')){
      const loginUrl = new URL("/auth/penjual/login", request.url)
      // Store the original URL as a query parameter to redirect back after login
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
    else{
      // Create the login URL with a redirect parameter
      const loginUrl = new URL("/login", request.url)
      // Store the original URL as a query parameter to redirect back after login
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // For all other cases, continue with the request
  return NextResponse.next()
}

// Configure which paths Middleware will run on - be more specific to avoid unnecessary executions
export const config = {
  matcher: [
    // Match specific paths where auth checks are needed
    "/penjual/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    // Add other specific paths as needed
  ],
}

