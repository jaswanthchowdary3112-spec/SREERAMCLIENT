import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            const { pathname } = req.nextUrl;

            // Public paths that do NOT require authentication
            const publicPaths = [
                "/api/admin/approve",
                "/api/auth/status",
                "/login",
                "/admin-login",
                "/register",
                "/api/debug",
                "/api/sync"
            ];

            // Media and static assets (standard Next.js optimization)
            if (
                pathname.startsWith("/_next") ||
                pathname.startsWith("/static") ||
                pathname.includes("favicon.ico")
            ) {
                return true;
            }

            // Allow public API routes and auth pages without a token
            if (publicPaths.some(path => pathname.startsWith(path))) {
                return true;
            }

            // Otherwise, requires a valid token
            return !!token;
        },
    },
});

export const config = {
    // Catch everything to let the authorized callback handle specifics
    matcher: ["/((?!api/movers|api/momentum|api/penny-stocks|api/overnight-analysis|api/header-data).*)"],
};
